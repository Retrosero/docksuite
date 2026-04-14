import { Injectable } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class TenantResolverService {
  resolveTenantId(request: Request): string | null {
    const headerTenantId = request.header("x-tenant-id");
    if (headerTenantId?.trim()) {
      return headerTenantId.trim().toLowerCase();
    }

    const host = request.hostname?.toLowerCase();
    if (!host) {
      return null;
    }

    const hostParts = host.split(".");
    if (hostParts.length < 3) {
      return null;
    }

    return hostParts[0] || null;
  }
}
