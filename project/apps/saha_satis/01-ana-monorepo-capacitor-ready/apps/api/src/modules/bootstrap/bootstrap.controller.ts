import { Controller, Get, Req } from "@nestjs/common";
import type { BootstrapResponseContract } from "@saha-satis/contracts";
import type { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { Permission } from "../auth/domain/permission.enum";
import type { RequestContext } from "../../shared/http/request-context";
import { BootstrapService } from "./bootstrap.service";

@Controller("bootstrap")
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Permissions(Permission.ORDER_READ)
  @Get()
  async getData(
    @Req() request: Request & RequestContext
  ): Promise<BootstrapResponseContract> {
    const tenantId = request.user?.tenantId ?? request.tenantId ?? "";
    const userId = request.user?.userId ?? "";
    return this.bootstrapService.getData(tenantId, userId);
  }
}
