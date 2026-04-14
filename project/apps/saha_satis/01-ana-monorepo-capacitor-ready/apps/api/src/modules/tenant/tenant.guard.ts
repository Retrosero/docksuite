import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from "@nestjs/common";
import type { Request } from "express";
import type { RequestContext } from "../../shared/http/request-context";
import { TenantResolverService } from "./tenant-resolver.service";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantResolverService: TenantResolverService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & RequestContext>();
    const tenantId = this.tenantResolverService.resolveTenantId(request);

    if (!tenantId) {
      throw new BadRequestException(
        "Tenant bilgisi bulunamadı. x-tenant-id başlığı veya subdomain gerekli."
      );
    }

    request.tenantId = tenantId;
    return true;
  }
}
