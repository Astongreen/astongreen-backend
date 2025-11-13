import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'P@ssw0rd!' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}


