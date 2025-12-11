import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/email/email.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Errors } from 'src/common/constants/messages';
import { User } from 'src/users/entities/user.entity';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly redis: RedisService,
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
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(Errors.AUTH.INVALID_CREDENTIALS);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(Errors.AUTH.INVALID_CREDENTIALS);
    }
    if (user.isBlocked) {
      throw new UnauthorizedException(Errors.USER.USER_IS_BLOCKED);
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const userInfo: User = await this.usersService.updateLastLoginAt(user.id);
    return {
      accessToken,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        profilePicture: userInfo.profilePicture,
        lastLoginAt: userInfo.lastLoginAt,
      },
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(Errors.AUTH.USER_NOT_FOUND);
    }
    const code = this.generateOtp();
    const ttlSeconds = 10 * 60;
    const key = `pwd_reset:${user.id}`;
    // Store OTP with TTL; overwrite any previous pending code for this user
    await this.redis.set<string>(key, code, ttlSeconds);
    await this.emailService.sendPasswordResetOtpEmail(email, code);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid code or email');
    }
    const key = `pwd_reset:${user.id}`;
    const storedCode = await this.redis.get<string>(key);
    if (!storedCode) {
      throw new BadRequestException(Errors.AUTH.INVALID_OTP_CODE);
    }
    if (storedCode !== code) {
      throw new BadRequestException(Errors.AUTH.INVALID_OTP_CODE);
    }
    await this.usersService.updatePassword(user.id, newPassword);
    // Invalidate the OTP to prevent reuse
    await this.redis.del(key);
  }
}


