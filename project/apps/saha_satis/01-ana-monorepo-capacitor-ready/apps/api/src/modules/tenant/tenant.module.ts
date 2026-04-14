import { Module } from "@nestjs/common";
import { TenantResolverService } from "./tenant-resolver.service";
import { TenantService } from "./tenant.service";

@Module({
  providers: [TenantResolverService, TenantService],
  exports: [TenantResolverService, TenantService]
})
export class TenantModule {}
