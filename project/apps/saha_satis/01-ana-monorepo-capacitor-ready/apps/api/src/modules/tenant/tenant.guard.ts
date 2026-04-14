import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { RequestContext } from "../../shared/http/request-context";
import { SKIP_TENANT_KEY } from "./decorators/skip-tenant.decorator";
import { TenantResolverService } from "./tenant-resolver.service";
import { TenantService } from "./tenant.service";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantResolverService: TenantResolverService,
    private readonly tenantService: TenantService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (skipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & RequestContext>();
    const tenantSlug = this.tenantResolverService.resolveTenantSlug(request);

    if (!tenantSlug) {
      throw new BadRequestException(
        "Tenant bilgisi bulunamadı. x-tenant-id başlığı veya subdomain gerekli."
      );
    }

    const tenant = await this.tenantService.resolveTenantBySlug(tenantSlug);
    request.tenantSlug = tenant.slug;
    request.tenantId = tenant.id;
    return true;
  }
}
