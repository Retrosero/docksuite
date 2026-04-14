import type { Role } from "../../modules/auth/domain/role.enum";

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  roles: Role[];
  permissions: string[];
}

export interface RequestContext {
  tenantSlug?: string;
  tenantId?: string;
  user?: AuthenticatedUser;
}
