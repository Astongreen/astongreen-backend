import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../common/email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailModule,
    RedisModule,
    // TypeOrmModule.forFeature([PasswordResetOtp]), // no longer needed, OTP handled via Redis
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const expiresStr = config.get<string>('JWT_EXPIRES_IN')!;
        const expiresIn = Number.isNaN(parseInt(expiresStr, 10)) ? 86400 : parseInt(expiresStr, 10);
        return {
          secret: config.get<string>('JWT_SECRET')!,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }


