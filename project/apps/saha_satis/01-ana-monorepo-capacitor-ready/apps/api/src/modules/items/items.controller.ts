import { Controller, Get, Req } from "@nestjs/common";
import type { ItemsResponseContract } from "@saha-satis/contracts";
import type { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { Permission } from "../auth/domain/permission.enum";
import type { RequestContext } from "../../shared/http/request-context";
import { ItemsService } from "./items.service";

@Controller("items")
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Permissions(Permission.ORDER_READ)
  @Get()
  async list(
    @Req() request: Request & RequestContext
  ): Promise<ItemsResponseContract> {
    const tenantId = request.user?.tenantId ?? request.tenantId ?? "";
    const items = await this.itemsService.list(tenantId);
    return { items };
  }
}
