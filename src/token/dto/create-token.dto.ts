import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TokenType } from '../enums/token.enum';
import { TokenDistributionDto, TokenDistributionItemDto } from './token-distribution-item.dto';

export class CreateTokenDto {
  @ApiProperty({ enum: TokenType })
  @IsEnum(TokenType)
  tokenType: TokenType;

  @ApiProperty({ type: [TokenDistributionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TokenDistributionDto)
  tokenDistribution?: TokenDistributionDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  companyId: string;
}


