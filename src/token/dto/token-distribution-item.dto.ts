import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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


