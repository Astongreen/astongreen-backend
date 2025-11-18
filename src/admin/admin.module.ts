import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CompaniesModule, ProjectsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }


