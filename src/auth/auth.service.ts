import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/email/email.service';
import { PasswordResetOtp } from './entities/password-reset-otp.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Errors } from 'src/common/constants/messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(PasswordResetOtp)
    private readonly otpRepository: Repository<PasswordResetOtp>,
  ) { }

  async signup(signupDto: SignupDto) {
    const user = await this.usersService.createInvestor(signupDto.email, signupDto.password);
    return { id: user.id, email: user.email };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;
    const user = await this.usersService.findByEmailAndRole(email, role);
    if (!user) {
      throw new UnauthorizedException(Errors.AUTH.INVALID_CREDENTIALS);
    }
    const isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(Errors.AUTH.INVALID_CREDENTIALS);
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Do not reveal user existence
      return;
    }
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otp = this.otpRepository.create({
      user,
      code,
      expiresAt,
    });
    await this.otpRepository.save(otp);
    await this.emailService.sendPasswordResetOtpEmail(email, code);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid code or email');
    }
    const otp = await this.otpRepository.findOne({
      where: { user: { id: user.id }, code },
      order: { createdAt: 'desc' },
    });
    if (!otp) {
      throw new BadRequestException('Invalid code');
    }
    if (otp.usedAt) {
      throw new BadRequestException('Code already used');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Code expired');
    }
    await this.usersService.updatePassword(user.id, newPassword);
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);
  }
}


