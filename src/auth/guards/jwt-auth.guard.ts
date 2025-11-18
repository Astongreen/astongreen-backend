import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const can = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        const user = request.user as { userId: string; role: UserRole; email: string } | undefined;
        if (user) {
            request.auth = { userId: user.userId, role: user.role, email: user.email };
        }
        return can;
    }

    handleRequest(err: unknown, user: any, _info?: unknown) {
        if (err || !user) {
            throw new UnauthorizedException('Invalid or missing authentication token');
        }
        return user;
    }
}
