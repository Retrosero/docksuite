import { Controller, Get, Req } from "@nestjs/common";
import type { CustomersResponseContract } from "@saha-satis/contracts";
import type { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { Permission } from "../auth/domain/permission.enum";
import type { RequestContext } from "../../shared/http/request-context";
import { CustomersService } from "./customers.service";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Permissions(Permission.ORDER_READ)
  @Get()
  async list(
    @Req() request: Request & RequestContext
  ): Promise<CustomersResponseContract> {
    const tenantId = request.user?.tenantId ?? request.tenantId ?? "";
    const customers = await this.customersService.list(tenantId);
    return { customers };
  }
}
