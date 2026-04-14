import { Injectable } from "@nestjs/common";
import { Permission } from "./domain/permission.enum";
import { ROLE_PERMISSIONS } from "./domain/role-permission.map";
import { Role } from "./domain/role.enum";

interface TenantUserRecord {
  userId: string;
  email: string;
  password: string;
  roles: Role[];
  permissions: Permission[];
}

@Injectable()
export class AuthRepository {
  private readonly usersByTenant: Record<string, TenantUserRecord[]> = {
    demo: [
      {
        userId: "u_admin_demo",
        email: "admin@demo.local",
        password: "demo123",
        roles: [Role.ADMIN],
        permissions: ROLE_PERMISSIONS[Role.ADMIN]
      },
      {
        userId: "u_sales_demo",
        email: "satis@demo.local",
        password: "demo123",
        roles: [Role.SALES_REP],
        permissions: ROLE_PERMISSIONS[Role.SALES_REP]
      }
    ]
  };

  findByCredentials(
    tenantId: string,
    email: string,
    password: string
  ): TenantUserRecord | null {
    const tenantUsers = this.usersByTenant[tenantId] ?? [];
    return (
      tenantUsers.find(
        (user) => user.email === email.toLowerCase() && user.password === password
      ) ?? null
    );
  }
}
