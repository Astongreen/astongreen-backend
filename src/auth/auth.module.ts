import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../common/email/email.module';
import { PasswordResetOtp } from './entities/password-reset-otp.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([PasswordResetOtp]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const expiresStr = config.get<string>('JWT_EXPIRES_IN', '86400');
        const expiresIn = Number.isNaN(parseInt(expiresStr, 10)) ? 86400 : parseInt(expiresStr, 10);
        return {
          secret: config.get<string>('JWT_SECRET', 'change_me'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}


