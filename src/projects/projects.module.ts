import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { Company } from 'src/companies/entities/company.entity';
import { ProjectDetails } from './entities/project-details.entity';
import { ProjectCapital } from './entities/project-capital.entity';
import { ProjectCo2Registry } from './entities/project-co2-registry.entity';
import { ProjectTokenization } from './entities/project-tokenization.entity';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Company, ProjectDetails, ProjectCapital, ProjectCo2Registry, ProjectTokenization]), PaginationModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}


