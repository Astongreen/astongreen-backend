import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType } from 'src/common/enums/role.enum';

export class TokenDistributionItemDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  totalTokenDistribution: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class TokenDistributionDto {
  @ApiProperty({ enum: ProjectType })
  @IsEnum(ProjectType)
  projectType: ProjectType;

  @ApiProperty({ type: [TokenDistributionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TokenDistributionItemDto)
  distrubutionItems: TokenDistributionItemDto[];
}