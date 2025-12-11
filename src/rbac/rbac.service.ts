import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) {}

  async getAll(): Promise<RolePermission[]> {
    return await this.rolePermRepo.find();
  }

  async getByRole(role: UserRole): Promise<RolePermission> {
    const found = await this.rolePermRepo.findOne({ where: { role } });
    if (!found) {
      throw new NotFoundException(`Permissions for role ${role} not found`);
    }
    return found;
  }

  async upsert(role: UserRole, permissions: Permission[]): Promise<RolePermission> {
    const trimmed = Array.from(new Set(permissions ?? [])).filter(Boolean) as Permission[];
    const existing = await this.rolePermRepo.findOne({ where: { role } });
    if (existing) {
      existing.permissions = trimmed;
      return await this.rolePermRepo.save(existing);
    }
    const created = this.rolePermRepo.create({ role, permissions: trimmed });
    return await this.rolePermRepo.save(created);
  }
}


