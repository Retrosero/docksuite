import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { RequestContext } from "../../../shared/http/request-context";
import { TokenService } from "../token.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & RequestContext>();
    const authorization = request.header("authorization") ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedException("Bearer token gereklidir.");
    }

    const user = this.tokenService.verify(token);
    if (request.tenantId && user.tenantId !== request.tenantId) {
      throw new UnauthorizedException("Token tenant bilgisi istek tenantı ile uyuşmuyor.");
    }

    request.user = user;
    return true;
  }
}
