import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { TokenStatus, TokenType } from "../enums/token.enum";

export class GetAllTokensDto {
    @ApiProperty({ required: false, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(TokenStatus)
    status?: TokenStatus;


    @ApiProperty({ required: false, description: 'Filter by company id' })
    @IsOptional()
    @IsString()
    companyId?: string;


    @ApiProperty({ required: false, description: 'Filter by token type' })
    @IsOptional()
    @IsEnum(TokenType)
    tokenType?: TokenType;

}