import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/common/enums/role.enum";

export class AddNewUserDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: 'investor@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Company Name' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: 'Address' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'Pin Code' })
    @IsString()
    pinCode: string;

    @ApiProperty({ example: 'Phone Number' })
    @IsString()
    phoneNumber: string;
}

export class UpdateUserDto {
    @ApiProperty({ required: false, example: 'John' })
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false, example: 'Doe' })
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false, enum: UserRole })
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false, example: 'Company Name' })
    @IsString()
    companyName?: string;

    @ApiProperty({ required: false, example: 'Address' })
    @IsString()
    address?: string;

    @ApiProperty({ required: false, example: 'Pin Code' })
    @IsString()
    pinCode?: string;

    @ApiProperty({ required: false, example: 'Phone Number' })
    @IsString()
    phoneNumber?: string;
}

export class BlockUnblockUserDto {
    @ApiProperty({ example: true })
    isBlocked: boolean;
}

export class GetAllUsersDto {
    @ApiProperty({ required: false, enum: UserRole })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}