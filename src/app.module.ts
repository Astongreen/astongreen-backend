import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './common/email/email.module';
import { AdminModule } from './admin/admin.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { QueryTransformMiddleware } from './common/middlewares/query-transform/query-transform.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
    }),
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
      }),
    }),
    UsersModule,
    EmailModule,
    AuthModule,
    AdminModule,
    CompaniesModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        QueryTransformMiddleware,
      )
      .forRoutes('/*path');
  }
}
