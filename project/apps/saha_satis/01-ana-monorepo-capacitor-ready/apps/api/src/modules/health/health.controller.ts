import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { SkipTenant } from "../tenant/decorators/skip-tenant.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @SkipTenant()
  @Get()
  async health(): Promise<{ status: string; database: string }> {
    return this.healthService.getHealth();
  }
}
