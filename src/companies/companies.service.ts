import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Errors } from 'src/common/constants/messages';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { CompanyStatus } from './types/company.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly paginationService: PaginationService,
  ) { }

  async create(dto: { status?: CompanyStatus } & CreateCompanyDto, createdBy: any): Promise<Company> {
    let existing = await this.companyRepository.findOne({ where: { registrationNumber: dto.registrationNumber } });
    if (existing) {
      throw new ConflictException(Errors.COMPANY.COMPANY_ALREADY_EXISTS);
    }
    existing = await this.companyRepository.findOne({ where: { vatNumber: dto.vatNumber } });
    if (existing) {
      throw new ConflictException(Errors.COMPANY.COMPANY_WITH_THIS_VAT_NUMBER_ALREADY_EXISTS);
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
      createdBy: createdBy,
      status: dto.status ?? CompanyStatus.PENDING,
    });
    return await this.companyRepository.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto, userId: string, isSuperAdmin: boolean): Promise<Company> {
    const existing = await this.companyRepository.findOne({ where: { companyId: id } });
    if (!existing) {
      throw new NotFoundException(Errors.COMPANY.COMPANY_NOT_FOUND);
    }
    if (existing?.createdBy !== userId) {
      throw new ForbiddenException(Errors.COMPANY.COMPANY_NOT_ALLOWED_TO_UPDATE);
    }
    if (existing.status === CompanyStatus.APPROVED && !isSuperAdmin) {
      throw new BadRequestException(Errors.COMPANY.COMPANY_ALREADY_APPROVED);
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
    const company = await this.companyRepository.findOne({ where: { companyId: id } });
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

  async approveOrRejectCompany(dto: { id: string, status: CompanyStatus, rejectReason?: string }): Promise<Company> {
    const existing = await this.companyRepository.findOne({ where: { companyId: dto.id } });
    if (!existing) {
      throw new NotFoundException(Errors.COMPANY.COMPANY_NOT_FOUND);
    }
    if (existing.status === CompanyStatus.APPROVED) {
      throw new BadRequestException(Errors.COMPANY.COMPANY_ALREADY_APPROVED);
    }
    existing.status = dto.status;
    existing.rejectReason = dto.status === CompanyStatus.REJECTED ? dto.rejectReason : null;
    return await this.companyRepository.save(existing);
  }

  async getAllApprovedCompanies(): Promise<Company[]> {
    return await this.companyRepository.find({ where: { status: CompanyStatus.APPROVED }, order: { createdAt: 'DESC' } as FindOptionsOrder<Company> });
  }
}


