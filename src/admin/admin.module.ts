import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { EmailModule } from 'src/common/email/email.module';
import { RbacModule } from 'src/rbac/rbac.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CompaniesModule, ProjectsModule, EmailModule, RbacModule, PaginationModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }


