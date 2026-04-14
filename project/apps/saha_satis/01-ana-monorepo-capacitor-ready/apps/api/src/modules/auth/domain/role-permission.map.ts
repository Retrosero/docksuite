import { Permission } from "./permission.enum";
import { Role } from "./role.enum";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.TENANT_MANAGE
  ],
  [Role.SALES_MANAGER]: [Permission.ORDER_CREATE, Permission.ORDER_READ],
  [Role.SALES_REP]: [Permission.ORDER_CREATE, Permission.ORDER_READ]
};
