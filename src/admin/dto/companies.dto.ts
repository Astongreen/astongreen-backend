import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompanyStatus } from 'src/companies/types/company.enum';

export class GetAllCompaniesDto {
    @ApiProperty({ required: false, description: 'Free text search across company fields' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string;

    @ApiProperty({ required: false, description: 'Filter by country name' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;
}


export class ApproveOrRejectCompanyDto {

    @ApiProperty({ description: 'Status' })
    @IsNotEmpty()
    @IsEnum(CompanyStatus)
    status?: CompanyStatus;

    @ApiProperty({ required: false, description: 'Reject reason' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    rejectReason?: string;
}