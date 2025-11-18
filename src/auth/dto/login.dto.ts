import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsNotEmpty()
  password: string;
}


