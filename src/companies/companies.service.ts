import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Errors } from 'src/common/constants/messages';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly paginationService: PaginationService,
  ) { }

  async create(dto: CreateCompanyDto): Promise<Company> {
    const existing = await this.companyRepository.findOne({ where: { registrationNumber: dto.registrationNumber } });
    if (existing) {
      throw new ConflictException(Errors.COMPANY.COMPANY_ALREADY_EXISTS);
    }
    const company = this.companyRepository.create({
      name: dto.name,
      registrationNumber: dto.registrationNumber ?? null,
      vatNumber: dto.vatNumber ?? null,
      country: dto.country,
      address: dto.address,
      spocName: dto.spocName,
      spocEmail: dto.spocEmail,
      spocNumber: dto.spocNumber,
      documents: dto.documents ?? null,
    });
    return await this.companyRepository.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const existing = await this.companyRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Company not found');
    }
    const merged = this.companyRepository.merge(existing, {
      name: dto.name ?? existing.name,
      registrationNumber: dto.registrationNumber ?? existing.registrationNumber,
      vatNumber: dto.vatNumber ?? existing.vatNumber,
      country: dto.country ?? existing.country,
      address: dto.address ?? existing.address,
      spocName: dto.spocName ?? existing.spocName,
      spocEmail: dto.spocEmail ?? existing.spocEmail,
      spocNumber: dto.spocNumber ?? existing.spocNumber,
      documents: dto.documents ?? existing.documents,
    });
    return await this.companyRepository.save(merged);
  }


  async getCompanyById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(Errors.COMPANY.COMPANY_NOT_FOUND);
    }
    return company;
  }

  async getAllCompanies(
    whereCondition: Record<string, any>,
    options: QueryTransformOptions,
  ) {
    return this.paginationService.applyPaginationAndFilters(
      this.companyRepository,
      [],
      whereCondition,
      [],
      options,
      ['name', 'registrationNumber', 'vatNumber', 'country', 'address', 'spocName', 'spocEmail', 'spocNumber'],
    );
  }

}


