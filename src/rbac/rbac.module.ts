import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { RbacService } from './rbac.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  providers: [RbacService],
  exports: [RbacService, TypeOrmModule],
})
export class RbacModule {}


