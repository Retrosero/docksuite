import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { Role } from "../domain/role.enum";
import type { RequestContext } from "../../../shared/http/request-context";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & RequestContext>();
    const userRoles = request.user?.roles ?? [];
    const hasAnyRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasAnyRole) {
      throw new ForbiddenException("Bu işlem için gerekli role sahip değilsiniz.");
    }

    return true;
  }
}
