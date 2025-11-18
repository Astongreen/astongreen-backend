import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Company } from 'src/companies/entities/company.entity';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { ProjectStatus } from './types/project.enum';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
        private readonly paginationService: PaginationService,
    ) { }

    async create(dto: CreateProjectDto & { status: ProjectStatus }, createdBy: string): Promise<Project> {
        const existing = await this.projectRepository.findOne({ where: { projectCode: (dto as any).basicInfo?.projectCode } as any });
        if (existing) {
            throw new ConflictException('Project with this code already exists');
        }

        const project = this.projectRepository.create({
            projectName: (dto as any).basicInfo?.projectName,
            projectCode: (dto as any).basicInfo?.projectCode,
            typeOfProject: (dto as any).basicInfo?.typeOfProject,
            legalSpvName: (dto as any).basicInfo?.legalSpvName,
            // set relation by id (avoids extra query and guarantees FK set)
            company: (dto as any).basicInfo?.companyId
                ? ({ companyId: (dto as any).basicInfo.companyId } as any)
                : undefined,
            details: {
                dateOfCommissioningExpected: (dto as any).details?.dateOfCommissioningExpected ? new Date((dto as any).details?.dateOfCommissioningExpected) : null,
                tariff: (dto as any).details?.tariff !== undefined ? String((dto as any).details?.tariff) : null,
                creditRatingOfCharter: (dto as any).details?.creditRatingOfCharter ?? null,
                internalCreditRating: (dto as any).details?.internalCreditRating ?? null,
                concessionAgreementTenure: (dto as any).details?.concessionAgreementTenure ?? null,
                locationCoordinates: (dto as any).details?.locationCoordinates ?? null,
                nameOfCharter: (dto as any).details?.nameOfCharter ?? null,
                projectCapacity: (dto as any).details?.projectCapacity ?? null,
                externalCreditRating: (dto as any).details?.externalCreditRating ?? null,
            },
            capital: {
                paidUpEquityCapital: (dto as any).capital?.paidUpEquityCapital !== undefined ? String((dto as any).capital?.paidUpEquityCapital) : null,
                debtFromBanks: (dto as any).capital?.debtFromBanks !== undefined ? String((dto as any).capital?.debtFromBanks) : null,
                tenureOfDebtYears: (dto as any).capital?.tenureOfDebtYears ?? null,
                interestRatePercent: (dto as any).capital?.interestRatePercent !== undefined ? String((dto as any).capital?.interestRatePercent) : null,
                dscr: (dto as any).capital?.dscr !== undefined ? String((dto as any).capital?.dscr) : null,
                prbPreTaxPercent: (dto as any).capital?.prbPreTaxPercent !== undefined ? String((dto as any).capital?.prbPreTaxPercent) : null,
                totalSharesSubscribed: (dto as any).capital?.totalSharesSubscribed !== undefined ? String((dto as any).capital?.totalSharesSubscribed) : null,
                currentBookValuePerShare: (dto as any).capital?.currentBookValuePerShare !== undefined ? String((dto as any).capital?.currentBookValuePerShare) : null,
                capitalRaisedByPromoters: (dto as any).capital?.capitalRaisedByPromoters !== undefined ? String((dto as any).capital?.capitalRaisedByPromoters) : null,
            },
            co2Registry: {
                registryName: (dto as any).co2Registry?.registryName ?? null,
                registryProjectId: (dto as any).co2Registry?.registryProjectId ?? null,
                dateOfPddRegistration: (dto as any).co2Registry?.dateOfPddRegistration ? new Date((dto as any).co2Registry?.dateOfPddRegistration) : null,
                co2IssuedSoFar: (dto as any).co2Registry?.co2IssuedSoFar !== undefined ? String((dto as any).co2Registry?.co2IssuedSoFar) : null,
                registeredMitigationOutcome: (dto as any).co2Registry?.registeredMitigationOutcome ?? false,
            },
            tokenization: {
                investmentTokenChosen: (dto as any).tokenization?.investmentTokenChosen ?? null,
                interestInListing: (dto as any).tokenization?.interestInListing ?? null,
                dcoRegistrationServiceProvided: (dto as any).tokenization?.dcoRegistrationServiceProvided ?? false,
                co2ServicesPerformed: (dto as any).tokenization?.co2ServicesPerformed ?? false,
                keyProjectDocuments: (dto as any).tokenization?.keyProjectDocuments ?? null,
                tokenConversionRule: (dto as any).tokenization?.tokenConversionRule ?? null,
                tokenPrice: (dto as any).tokenization?.tokenPrice !== undefined ? String((dto as any).tokenization?.tokenPrice) : null,
                tokenPriceCurrency: (dto as any).tokenization?.tokenPriceCurrency ?? null,
            },
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
        const newCompanyId: string | undefined = (dto as any).basicInfo?.companyId;

        const merged = this.projectRepository.merge(existing, {
            projectName: (dto as any).basicInfo?.projectName ?? existing.projectName,
            projectCode: (dto as any).basicInfo?.projectCode ?? existing.projectCode,
            typeOfProject: (dto as any).basicInfo?.typeOfProject ?? existing.typeOfProject,
            legalSpvName: (dto as any).basicInfo?.legalSpvName ?? existing.legalSpvName,
            company: newCompanyId !== undefined ? ({ companyId: newCompanyId } as any) : existing.company,
            details: {
                ...(existing as any).details,
                dateOfCommissioningExpected: (dto as any).details?.dateOfCommissioningExpected ? new Date((dto as any).details?.dateOfCommissioningExpected) : (existing as any).details?.dateOfCommissioningExpected,
                tariff: (dto as any).details?.tariff !== undefined ? String((dto as any).details?.tariff) : (existing as any).details?.tariff,
                creditRatingOfCharter: (dto as any).details?.creditRatingOfCharter ?? (existing as any).details?.creditRatingOfCharter,
                internalCreditRating: (dto as any).details?.internalCreditRating ?? (existing as any).details?.internalCreditRating,
                concessionAgreementTenure: (dto as any).details?.concessionAgreementTenure ?? (existing as any).details?.concessionAgreementTenure,
                locationCoordinates: (dto as any).details?.locationCoordinates ?? (existing as any).details?.locationCoordinates,
                nameOfCharter: (dto as any).details?.nameOfCharter ?? (existing as any).details?.nameOfCharter,
                projectCapacity: (dto as any).details?.projectCapacity ?? (existing as any).details?.projectCapacity,
                externalCreditRating: (dto as any).details?.externalCreditRating ?? (existing as any).details?.externalCreditRating,
            } as any,
            capital: {
                ...(existing as any).capital,
                paidUpEquityCapital: (dto as any).capital?.paidUpEquityCapital !== undefined ? String((dto as any).capital?.paidUpEquityCapital) : (existing as any).capital?.paidUpEquityCapital,
                debtFromBanks: (dto as any).capital?.debtFromBanks !== undefined ? String((dto as any).capital?.debtFromBanks) : (existing as any).capital?.debtFromBanks,
                tenureOfDebtYears: (dto as any).capital?.tenureOfDebtYears ?? (existing as any).capital?.tenureOfDebtYears,
                interestRatePercent: (dto as any).capital?.interestRatePercent !== undefined ? String((dto as any).capital?.interestRatePercent) : (existing as any).capital?.interestRatePercent,
                dscr: (dto as any).capital?.dscr !== undefined ? String((dto as any).capital?.dscr) : (existing as any).capital?.dscr,
                prbPreTaxPercent: (dto as any).capital?.prbPreTaxPercent !== undefined ? String((dto as any).capital?.prbPreTaxPercent) : (existing as any).capital?.prbPreTaxPercent,
                totalSharesSubscribed: (dto as any).capital?.totalSharesSubscribed !== undefined ? String((dto as any).capital?.totalSharesSubscribed) : (existing as any).capital?.totalSharesSubscribed,
                currentBookValuePerShare: (dto as any).capital?.currentBookValuePerShare !== undefined ? String((dto as any).capital?.currentBookValuePerShare) : (existing as any).capital?.currentBookValuePerShare,
                capitalRaisedByPromoters: (dto as any).capital?.capitalRaisedByPromoters !== undefined ? String((dto as any).capital?.capitalRaisedByPromoters) : (existing as any).capital?.capitalRaisedByPromoters,
            } as any,
            co2Registry: {
                ...(existing as any).co2Registry,
                registryName: (dto as any).co2Registry?.registryName ?? (existing as any).co2Registry?.registryName,
                registryProjectId: (dto as any).co2Registry?.registryProjectId ?? (existing as any).co2Registry?.registryProjectId,
                dateOfPddRegistration: (dto as any).co2Registry?.dateOfPddRegistration ? new Date((dto as any).co2Registry?.dateOfPddRegistration) : (existing as any).co2Registry?.dateOfPddRegistration,
                co2IssuedSoFar: (dto as any).co2Registry?.co2IssuedSoFar !== undefined ? String((dto as any).co2Registry?.co2IssuedSoFar) : (existing as any).co2Registry?.co2IssuedSoFar,
                registeredMitigationOutcome: (dto as any).co2Registry?.registeredMitigationOutcome ?? (existing as any).co2Registry?.registeredMitigationOutcome,
            } as any,
            tokenization: {
                ...(existing as any).tokenization,
                investmentTokenChosen: (dto as any).tokenization?.investmentTokenChosen ?? (existing as any).tokenization?.investmentTokenChosen,
                interestInListing: (dto as any).tokenization?.interestInListing ?? (existing as any).tokenization?.interestInListing,
                dcoRegistrationServiceProvided: (dto as any).tokenization?.dcoRegistrationServiceProvided ?? (existing as any).tokenization?.dcoRegistrationServiceProvided,
                co2ServicesPerformed: (dto as any).tokenization?.co2ServicesPerformed ?? (existing as any).tokenization?.co2ServicesPerformed,
                keyProjectDocuments: (dto as any).tokenization?.keyProjectDocuments ?? (existing as any).tokenization?.keyProjectDocuments,
                tokenConversionRule: (dto as any).tokenization?.tokenConversionRule ?? (existing as any).tokenization?.tokenConversionRule,
                tokenPrice: (dto as any).tokenization?.tokenPrice !== undefined ? String((dto as any).tokenization?.tokenPrice) : (existing as any).tokenization?.tokenPrice,
                tokenPriceCurrency: (dto as any).tokenization?.tokenPriceCurrency ?? (existing as any).tokenization?.tokenPriceCurrency,
            } as any,
            status: (dto as any).status ?? existing.status,
        });
        return await this.projectRepository.save(merged);
    }

    async getProjectById(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { projectId: id } });
        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async getAllProjects(whereCondition: Record<string, any>, options: QueryTransformOptions) {
        return this.paginationService.applyPaginationAndFilters(
            this.projectRepository,
            [
                'projectName',
                'projectCode',
                'typeOfProject',
                'legalSpvName',
                'co2Registry.registryName',
                'co2Registry.registryProjectId',
                'co2Registry.dateOfPddRegistration',
                'co2Registry.co2IssuedSoFar',
                'co2Registry.registeredMitigationOutcome',
                'capital.paidUpEquityCapital',
                'capital.debtFromBanks',
                'capital.tenureOfDebtYears',
                'capital.interestRatePercent',
                'capital.dscr',
                'capital.prbPreTaxPercent',
                'capital.totalSharesSubscribed',
                'capital.currentBookValuePerShare',
                'capital.capitalRaisedByPromoters',
                'details.dateOfCommissioningExpected',
                'details.tariff',
                'details.creditRatingOfCharter',
                'details.internalCreditRating',
                'details.concessionAgreementTenure',
                'details.locationCoordinates',
                'details.nameOfCharter',
                'details.projectCapacity',
                'details.externalCreditRating',
                'tokenization.investmentTokenChosen',
                'tokenization.interestInListing',
                'tokenization.dcoRegistrationServiceProvided',
                'tokenization.co2ServicesPerformed',
                'tokenization.keyProjectDocuments',
                'tokenization.tokenConversionRule',
                'tokenization.tokenPrice',
                'tokenization.tokenPriceCurrency',
            ],
            whereCondition,
            ['co2Registry', 'capital', 'details', 'tokenization'],
            options,
            [

            ],
        );
    }

    async approveOrRejectProject(input: { id: string; status: ProjectStatus; rejectReason?: string | null }) {
        const project = await this.projectRepository.findOne({ where: { projectId: input.id } });
        if (!project) throw new NotFoundException('Project not found');
        project.status = input.status;
        (project as any).rejectReason = input.rejectReason ?? null;
        return await this.projectRepository.save(project);
    }
}


