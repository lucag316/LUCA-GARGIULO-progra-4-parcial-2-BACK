import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) throw new ForbiddenException('Token no válido');

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.perfil !== 'administrador') {
      throw new ForbiddenException('No tenés permisos de administrador');
    }

    return true;
  }
}