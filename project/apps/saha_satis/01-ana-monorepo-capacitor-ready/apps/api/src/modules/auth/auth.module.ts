import { Module } from "@nestjs/common";
import { TenantModule } from "../tenant/tenant.module";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { TokenService } from "./token.service";

@Module({
  imports: [TenantModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, TokenService, AuthGuard],
  exports: [AuthService]
})
export class AuthModule {}
