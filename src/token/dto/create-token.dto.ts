import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TokenType } from '../enums/token.enum';
import { TokenDistributionItemDto } from './token-distribution-item.dto';

export class CreateTokenDto {
  @ApiProperty({ enum: TokenType })
  @IsEnum(TokenType)
  tokenType: TokenType;

  @ApiProperty({ type: [TokenDistributionItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TokenDistributionItemDto)
  tokenDistribution?: TokenDistributionItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  companyId: string;
}


