import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsDefined, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { ProjectType } from 'src/common/enums/role.enum';

export class ProjectBasicInfoDto {
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) projectName: string;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120) projectCode: string;
    @ApiProperty() @IsEnum(ProjectType) @IsNotEmpty() typeOfProject: ProjectType;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) legalSpvName: string;
    @ApiProperty({ required: true }) @IsDefined() @IsUUID() companyId: string;
}

export class ProjectDetailsDto {
    @ApiProperty({ example: '1763460135' }) @IsString() dateOfCommissioningExpected: string;
    @ApiProperty() @IsNumber() tariff: number;
    @ApiProperty() @IsString() @MaxLength(120) creditRatingOfCharter: string;
    @ApiProperty() @IsString() @MaxLength(120) internalCreditRating: string;
    @ApiProperty() @IsString() @MaxLength(120) concessionAgreementTenure: string;
    @ApiProperty() @IsString() @MaxLength(255) locationCoordinates: string;
    @ApiProperty() @IsString() @MaxLength(255) nameOfCharter: string;
    @ApiProperty() @IsString() @MaxLength(120) projectCapacity: string;
    @ApiProperty() @IsString() @MaxLength(120) externalCreditRating: string;
}

export class ProjectCapitalDto {
    @ApiProperty() @IsNumber() paidUpEquityCapital: number;
    @ApiProperty() @IsNumber() debtFromBanks: number;
    @ApiProperty() @IsInt() tenureOfDebtYears: number;
    @ApiProperty() @IsNumber() interestRatePercent: number;
    @ApiProperty() @IsNumber() dscr: number;
    @ApiProperty() @IsNumber() prbPreTaxPercent: number;
    @ApiProperty() @IsNumber() totalSharesSubscribed: number;
    @ApiProperty() @IsNumber() currentBookValuePerShare: number;
    @ApiProperty() @IsNumber() capitalRaisedByPromoters: number;
}

export class ProjectCo2Dto {
    @ApiProperty() @IsString() registryName: string;
    @ApiProperty() @IsString() registryProjectId: string;
    @ApiProperty({ example: '1763460135' }) @IsString() dateOfPddRegistration: string;
    @ApiProperty() @IsNumber() co2IssuedSoFar: number;
    @ApiProperty() @IsBoolean() registeredMitigationOutcome: boolean;
}

export class ProjectTokenizationDto {
    @ApiProperty() @IsString() investmentTokenChosen: string;
    @ApiProperty() @IsString() interestInListing: string;
    @ApiProperty() @IsBoolean() dcoRegistrationServiceProvided: boolean;
    @ApiProperty() @IsBoolean() co2ServicesPerformed: boolean;
    @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) keyProjectDocuments: string[];
    @ApiProperty() @IsString() tokenConversionRule: string;
    @ApiProperty() @IsNumber() tokenPrice: number;
    @ApiProperty() @IsString() tokenPriceCurrency: string;
}

export class CreateProjectDto {
    @ApiProperty({ type: ProjectBasicInfoDto }) @IsObject() @ValidateNested() @Type(() => ProjectBasicInfoDto) basicInfo: ProjectBasicInfoDto;
    @ApiProperty({ type: ProjectDetailsDto }) @IsObject() @ValidateNested() @Type(() => ProjectDetailsDto) details: ProjectDetailsDto;
    @ApiProperty({ type: ProjectCapitalDto }) @IsObject() @ValidateNested() @Type(() => ProjectCapitalDto) capital: ProjectCapitalDto;
    @ApiProperty({ type: ProjectCo2Dto }) @IsObject() @ValidateNested() @Type(() => ProjectCo2Dto) co2Registry: ProjectCo2Dto;
    @ApiProperty({ type: ProjectTokenizationDto }) @IsObject() @ValidateNested() @Type(() => ProjectTokenizationDto) tokenization: ProjectTokenizationDto;
}


