import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';
import { RbacService } from 'src/rbac/rbac.service';
import { UserRole } from '../enums/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly rbac: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.auth as { role?: UserRole } | undefined;
    if (!user?.role) return false;

    // SUPER_ADMIN always allowed
    if (user.role === UserRole.SUPER_ADMIN) return true;
    // Fetch role permissions
    try {
      const rolePerms = await this.rbac.getByRole(user.role);
      const set = new Set(rolePerms.permissions);
      return required.every(p => set.has(p));
    } catch {
      return false;
    }
  }
}


