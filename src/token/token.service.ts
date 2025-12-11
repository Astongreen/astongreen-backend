import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Token, TokenDistribution } from './entities/token.entity';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Errors } from 'src/common/constants/messages';
import { Project } from 'src/projects/entities/project.entity';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly paginationService: PaginationService,
  ) { }

  async health() {
    return { ok: true };
  }

  private async validateTokenDistributionProjects(tokenDistribution?: TokenDistribution[]) {
    if (!tokenDistribution || tokenDistribution.length === 0) return;
    const ids = tokenDistribution.flatMap(i => i.distrubutionItems.map(item => item.projectId));
    // Validate each id exists
    const found = await Promise.all(ids.map(id => this.projectRepository.findOne({ where: { projectId: id } })));
    const missingIndex = found.findIndex(p => !p);
    if (missingIndex !== -1) {
      throw new BadRequestException(`${Errors.PROJECT.PROJECT_NOT_FOUND}: ${ids[missingIndex]}`);
    }
  }

  async create(dto: CreateTokenDto): Promise<Token> {
    await this.validateTokenDistributionProjects(dto.tokenDistribution);
    const token = this.tokenRepository.create(dto);
    return await this.tokenRepository.save(token);
  }

  async update(id: string, dto: UpdateTokenDto): Promise<Token> {
    const existing = await this.tokenRepository.findOne({ where: { tokenId: id } });
    if (!existing) {
      throw new NotFoundException(Errors.PROJECT?.PROJECT_NOT_FOUND ?? 'Token not found');
    }
    if (dto.tokenDistribution) {
      await this.validateTokenDistributionProjects(dto.tokenDistribution);
    }
    await this.tokenRepository.update({ tokenId: id }, {
      tokenType: dto.tokenType ?? existing.tokenType,
      tokenDistribution: dto.tokenDistribution ?? existing.tokenDistribution,
      description: dto.description ?? existing.description,
    });
    const updated = await this.tokenRepository.findOne({ where: { tokenId: id } });
    if (!updated) {
      throw new NotFoundException('Token not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tokenRepository.delete({ tokenId: id });
    if (!result.affected) {
      throw new NotFoundException('Token not found');
    }
  }

  async getAllTokens(whereCondition: Record<string, any>, options: QueryTransformOptions) {
    const result = await this.paginationService.applyPaginationAndFilters(
      this.tokenRepository,
      [],
      whereCondition,
      ['company'],
      options,
      [],
    );
    // Enrich tokenDistribution items with projectName
    const allProjectIds = new Set<string>();
    (result.docs || []).forEach(token => {
      (token.tokenDistribution || []).forEach(item => {
        if (item?.distrubutionItems) item.distrubutionItems.forEach(item => allProjectIds.add(item.projectId));
      });
    });
    if (allProjectIds.size === 0) {
      return result;
    }
    const projects = await this.projectRepository.find({
      where: { projectId: In(Array.from(allProjectIds)) },
      select: ['projectId', 'projectName'],
    });
    const idToName = new Map(projects.map(p => [p.projectId, (p as any).projectName]));
    const enrichedDocs = (result.docs || []).map(token => ({
      ...token,
      tokenDistribution: (token.tokenDistribution || []).map(item => ({
        ...item,
        distrubutionItems: item.distrubutionItems.map(item => ({
          ...item,
          projectName: idToName.get(item.projectId) ?? null,
        })),
      })),
    })) as any;
    return { ...result, docs: enrichedDocs };
  }
}


