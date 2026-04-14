import { Injectable } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { Role } from "./domain/role.enum";
import { PrismaService } from "../../common/prisma.service";

export interface TenantUserRecord {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  passwordHash: string | null;
  roles: Role[];
  permissions: string[];
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByCredentials(
    tenantId: string,
    email: string,
  ): Promise<TenantUserRecord | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: email.toLowerCase()
        }
      },
      include: {
        tenant: {
          select: {
            slug: true
          }
        },
        userRoles: {
          include: {
            role: {
              include: {
                perms: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    const roles = user.userRoles
      .map((userRole) => this.parseRoleCode(userRole.role.code))
      .filter((role): role is Role => role !== null);

    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((userRole) =>
          userRole.role.perms.map((rolePermission) => rolePermission.permission.key)
        )
      )
    );

    return {
      userId: user.id,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
      email: user.email,
      passwordHash: user.passwordHash,
      roles,
      permissions
    };
  }

  private parseRoleCode(roleCode: string): Role | null {
    if (roleCode === Role.ADMIN) {
      return Role.ADMIN;
    }
    if (roleCode === Role.SALES_MANAGER) {
      return Role.SALES_MANAGER;
    }
    if (roleCode === Role.SALES_REP) {
      return Role.SALES_REP;
    }
    return null;
  }
}
