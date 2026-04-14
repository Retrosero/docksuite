import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Permissions } from "./decorators/permissions.decorator";
import { Public } from "./decorators/public.decorator";
import { Roles } from "./decorators/roles.decorator";
import { Permission } from "./domain/permission.enum";
import { Role } from "./domain/role.enum";
import type { LoginDto } from "./dto/login.dto";
import type { RequestContext } from "../../shared/http/request-context";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request & RequestContext
  ): Promise<{ accessToken: string }> {
    return this.authService.login(dto, request.tenantId ?? "");
  }

  @Get("me")
  me(
    @Req() request: Request & RequestContext
  ): { userId: string; tenantId: string; tenantSlug: string } {
    return {
      userId: request.user?.userId ?? "",
      tenantId: request.user?.tenantId ?? "",
      tenantSlug: request.user?.tenantSlug ?? ""
    };
  }

  @Roles(Role.ADMIN)
  @Permissions(Permission.TENANT_MANAGE)
  @Get("admin-check")
  adminCheck(): { message: string } {
    return { message: "Rol ve izin kontrolü başarılı." };
  }
}
