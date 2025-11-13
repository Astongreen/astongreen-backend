import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;

  @ApiProperty({ minLength: 8, example: 'N3wP@ssw0rd!' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}


