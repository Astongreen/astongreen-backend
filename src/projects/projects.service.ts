import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { ProjectStatus } from './types/project.enum';
import { Errors } from 'src/common/constants/messages';
import { ProjectType } from 'src/common/enums/role.enum';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        private readonly paginationService: PaginationService,
    ) { }

    // -----------------------
    // Mapping / conversion utils
    // -----------------------
    private static readonly SEARCHABLE_FIELDS: string[] = [
        'projectName',
        'projectCode',
        'typeOfProject',
        'legalSpvName',
        'company.companyId',
    ];

    private static readonly DEFAULT_RELATIONS: string[] = ['company'];

    private parseDateInput(input: unknown): Date | null {
        if (input === null || input === undefined) return null;
        // Accept number, numeric string (seconds or millis), or ISO string
        if (typeof input === 'number') {
            // assume epoch seconds if 10-11 digits, else millis
            const millis = input < 1e12 ? input * 1000 : input;
            return new Date(millis);
        }
        if (typeof input === 'string') {
            const trimmed = input.trim();
            if (!trimmed) return null;
            if (/^\d+$/.test(trimmed)) {
                const num = Number(trimmed);
                const millis = trimmed.length <= 11 ? num * 1000 : num;
                return new Date(millis);
            }
            const d = new Date(trimmed);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    }

    private toStringOrNull(value: unknown): string | null {
        return value !== undefined ? String(value) : null;
    }

    private mapDetails(details: any, existing?: any) {
        const base = existing ?? {};
        return {
            ...base,
            dateOfCommissioningExpected: details?.dateOfCommissioningExpected !== undefined
                ? this.parseDateInput(details?.dateOfCommissioningExpected)
                : base?.dateOfCommissioningExpected ?? null,
            tariff: details?.tariff !== undefined
                ? this.toStringOrNull(details?.tariff)
                : base?.tariff ?? null,
            creditRatingOfCharter: details?.creditRatingOfCharter ?? base?.creditRatingOfCharter ?? null,
            internalCreditRating: details?.internalCreditRating ?? base?.internalCreditRating ?? null,
            concessionAgreementTenure: details?.concessionAgreementTenure ?? base?.concessionAgreementTenure ?? null,
            locationCoordinates: details?.locationCoordinates ?? base?.locationCoordinates ?? null,
            nameOfCharter: details?.nameOfCharter ?? base?.nameOfCharter ?? null,
            projectCapacity: details?.projectCapacity ?? base?.projectCapacity ?? null,
            externalCreditRating: details?.externalCreditRating ?? base?.externalCreditRating ?? null,
        };
    }

    private mapCapital(capital: any, existing?: any) {
        const base = existing ?? {};
        return {
            ...base,
            paidUpEquityCapital: capital?.paidUpEquityCapital !== undefined
                ? this.toStringOrNull(capital?.paidUpEquityCapital)
                : base?.paidUpEquityCapital ?? null,
            debtFromBanks: capital?.debtFromBanks !== undefined
                ? this.toStringOrNull(capital?.debtFromBanks)
                : base?.debtFromBanks ?? null,
            tenureOfDebtYears: capital?.tenureOfDebtYears ?? base?.tenureOfDebtYears ?? null,
            interestRatePercent: capital?.interestRatePercent !== undefined
                ? this.toStringOrNull(capital?.interestRatePercent)
                : base?.interestRatePercent ?? null,
            dscr: capital?.dscr !== undefined
                ? this.toStringOrNull(capital?.dscr)
                : base?.dscr ?? null,
            prbPreTaxPercent: capital?.prbPreTaxPercent !== undefined
                ? this.toStringOrNull(capital?.prbPreTaxPercent)
                : base?.prbPreTaxPercent ?? null,
            totalSharesSubscribed: capital?.totalSharesSubscribed !== undefined
                ? this.toStringOrNull(capital?.totalSharesSubscribed)
                : base?.totalSharesSubscribed ?? null,
            currentBookValuePerShare: capital?.currentBookValuePerShare !== undefined
                ? this.toStringOrNull(capital?.currentBookValuePerShare)
                : base?.currentBookValuePerShare ?? null,
            capitalRaisedByPromoters: capital?.capitalRaisedByPromoters !== undefined
                ? this.toStringOrNull(capital?.capitalRaisedByPromoters)
                : base?.capitalRaisedByPromoters ?? null,
        };
    }

    private mapCo2Registry(co2Registry: any, existing?: any) {
        const base = existing ?? {};
        return {
            ...base,
            registryName: co2Registry?.registryName ?? base?.registryName ?? null,
            registryProjectId: co2Registry?.registryProjectId ?? base?.registryProjectId ?? null,
            dateOfPddRegistration: co2Registry?.dateOfPddRegistration !== undefined
                ? this.parseDateInput(co2Registry?.dateOfPddRegistration)
                : base?.dateOfPddRegistration ?? null,
            co2IssuedSoFar: co2Registry?.co2IssuedSoFar !== undefined
                ? this.toStringOrNull(co2Registry?.co2IssuedSoFar)
                : base?.co2IssuedSoFar ?? null,
            registeredMitigationOutcome: co2Registry?.registeredMitigationOutcome ?? base?.registeredMitigationOutcome ?? false,
        };
    }

    private mapTokenization(tokenization: any, existing?: any) {
        const base = existing ?? {};
        return {
            ...base,
            investmentTokenChosen: tokenization?.investmentTokenChosen ?? base?.investmentTokenChosen ?? null,
            interestInListing: tokenization?.interestInListing ?? base?.interestInListing ?? null,
            dcoRegistrationServiceProvided: tokenization?.dcoRegistrationServiceProvided ?? base?.dcoRegistrationServiceProvided ?? false,
            co2ServicesPerformed: tokenization?.co2ServicesPerformed ?? base?.co2ServicesPerformed ?? false,
            keyProjectDocuments: tokenization?.keyProjectDocuments ?? base?.keyProjectDocuments ?? null,
            tokenConversionRule: tokenization?.tokenConversionRule ?? base?.tokenConversionRule ?? null,
            tokenPrice: tokenization?.tokenPrice !== undefined
                ? this.toStringOrNull(tokenization?.tokenPrice)
                : base?.tokenPrice ?? null,
            tokenPriceCurrency: tokenization?.tokenPriceCurrency ?? base?.tokenPriceCurrency ?? null,
        };
    }

    async create(dto: CreateProjectDto & { status: ProjectStatus }, createdBy: string): Promise<Project> {
        const existing = await this.projectRepository.findOne({ where: { projectCode: (dto as any).basicInfo?.projectCode } as any });
        if (existing) {
            throw new ConflictException('Project with this code already exists');
        }

        const basicInfo = (dto as any).basicInfo ?? {};
        const project = this.projectRepository.create({
            projectName: basicInfo?.projectName,
            projectCode: basicInfo?.projectCode,
            typeOfProject: basicInfo?.typeOfProject,
            legalSpvName: basicInfo?.legalSpvName,
            company: basicInfo?.companyId ? ({ companyId: basicInfo.companyId } as any) : undefined,
            details: this.mapDetails((dto as any).details),
            capital: this.mapCapital((dto as any).capital),
            co2Registry: this.mapCo2Registry((dto as any).co2Registry),
            tokenization: this.mapTokenization((dto as any).tokenization),
            status: dto.status ?? ProjectStatus.PENDING,
            createdBy: { id: createdBy } as any,
        });
        return await this.projectRepository.save(project);
    }

    async update(id: string, dto: UpdateProjectDto): Promise<Project> {
        const existing = await this.projectRepository.findOne({ where: { projectId: id } });
        if (!existing) {
            throw new NotFoundException('Project not found');
        }
        const basicInfo = (dto as any).basicInfo ?? {};
        const newCompanyId: string | undefined = basicInfo?.companyId;

        const merged = this.projectRepository.merge(existing, {
            projectName: basicInfo?.projectName ?? existing.projectName,
            projectCode: basicInfo?.projectCode ?? existing.projectCode,
            typeOfProject: basicInfo?.typeOfProject ?? existing.typeOfProject,
            legalSpvName: basicInfo?.legalSpvName ?? existing.legalSpvName,
            company: newCompanyId !== undefined ? ({ companyId: newCompanyId } as any) : existing.company,
            details: this.mapDetails((dto as any).details, (existing as any).details),
            capital: this.mapCapital((dto as any).capital, (existing as any).capital),
            co2Registry: this.mapCo2Registry((dto as any).co2Registry, (existing as any).co2Registry),
            tokenization: this.mapTokenization((dto as any).tokenization, (existing as any).tokenization),
            status: (dto as any).status ?? existing.status,
        });
        return await this.projectRepository.save(merged);
    }

    async getProjectById(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { projectId: id } });
        if (!project) throw new NotFoundException(Errors.PROJECT.PROJECT_NOT_FOUND);
        return project;
    }

    async getAllProjects(whereCondition: Record<string, any>, options: QueryTransformOptions) {
        return this.paginationService.applyPaginationAndFilters(
            this.projectRepository,
            ProjectsService.SEARCHABLE_FIELDS,
            whereCondition,
            ProjectsService.DEFAULT_RELATIONS,
            options,
            [],
        );
    }

    async approveOrRejectProject(input: { id: string; status: ProjectStatus; rejectReason?: string | null }) {
        const project = await this.projectRepository.findOne({ where: { projectId: input.id } });
        if (!project) throw new NotFoundException(Errors.PROJECT.PROJECT_NOT_FOUND);
        project.status = input.status;
        (project as any).rejectReason = input.rejectReason ?? null;
        return await this.projectRepository.save(project);
    }

    async getProjectsByCompanyId(companyId: string) {
        const projects = await this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.company', 'company')
            .leftJoinAndSelect('project.details', 'details')
            .leftJoinAndSelect('project.capital', 'capital')
            .leftJoinAndSelect('project.co2Registry', 'co2Registry')
            .leftJoinAndSelect('project.tokenization', 'tokenization')
            .where('project.companyId = :companyId', { companyId: companyId })
            .getMany();

        return projects;
    }

    async getProjectsByProjectType(projectType: ProjectType) {
        const projects = await this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.company', 'company')
            .leftJoinAndSelect('project.details', 'details')
            .leftJoinAndSelect('project.capital', 'capital')
            .leftJoinAndSelect('project.co2Registry', 'co2Registry')
            .leftJoinAndSelect('project.tokenization', 'tokenization')
            .leftJoinAndSelect('project.createdBy', 'createdBy')
            .where('project.typeOfProject = :type', { type: projectType })
            .getMany();

        return projects;
    }
}


