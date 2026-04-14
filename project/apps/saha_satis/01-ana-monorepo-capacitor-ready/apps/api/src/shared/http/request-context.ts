import type { Role } from "../../modules/auth/domain/role.enum";

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  roles: Role[];
  permissions: string[];
}

export interface RequestContext {
  tenantId?: string;
  user?: AuthenticatedUser;
}
