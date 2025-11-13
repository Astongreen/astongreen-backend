import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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
