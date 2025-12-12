import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './common/email/email.module';
import { RedisModule } from './common/redis/redis.module';
import { AdminModule } from './admin/admin.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { QueryTransformMiddleware } from './common/middlewares/query-transform/query-transform.middleware';
import { TokenModule } from './token/token.module';
import { CronModule } from './services/cron/cron.module';
import { EventsModule } from './services/events/events.module';
import { EthersModule } from './services/ethers/ethers.module';
import { BlockModule } from './services/block/block.module';
import { NetworksModule } from './services/networks/networks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'dev'}`, '.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'aston_green'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        retryAttempts: 5,
        retryDelay: 3000,
        connectTimeout: 10000,
        extra: {
          connectionLimit: 10,
        },
        logging:
          config.get('NODE_ENV') === 'dev' ? ['error', 'warn'] : ['error'],
      }),
    }),
    UsersModule,
    EmailModule,
    RedisModule,
    AuthModule,
    AdminModule,
    CompaniesModule,
    ProjectsModule,
    TokenModule,
    CronModule,
    EventsModule,
    EthersModule,
    BlockModule,
    NetworksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(QueryTransformMiddleware).forRoutes('/*path');
  }
}
