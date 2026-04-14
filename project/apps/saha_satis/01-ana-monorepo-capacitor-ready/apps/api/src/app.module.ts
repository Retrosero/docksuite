import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./common/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuthGuard } from "./modules/auth/guards/auth.guard";
import { BootstrapModule } from "./modules/bootstrap/bootstrap.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { PermissionsGuard } from "./modules/auth/guards/permissions.guard";
import { RolesGuard } from "./modules/auth/guards/roles.guard";
import { HealthModule } from "./modules/health/health.module";
import { ItemsModule } from "./modules/items/items.module";
import { TenantGuard } from "./modules/tenant/tenant.guard";
import { TenantModule } from "./modules/tenant/tenant.module";

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    AuthModule,
    HealthModule,
    BootstrapModule,
    CustomersModule,
    ItemsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ]
})
export class AppModule {}
