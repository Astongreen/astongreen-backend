import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Project } from 'src/projects/entities/project.entity';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Project]), PaginationModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService, TypeOrmModule],
})
export class TokenModule { }


