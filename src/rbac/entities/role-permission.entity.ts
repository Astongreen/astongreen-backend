import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';
import { UserRole } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Entity({ name: 'role_permissions' })
@Unique(['role'])
export class RolePermission {
  @PrimaryColumn({ type: 'enum', enum: UserRole })
  role: UserRole;

  // MySQL does not allow DEFAULT for JSON columns; initialize in code instead
  @Column({ type: 'json', nullable: false })
  permissions: Permission[];
}


