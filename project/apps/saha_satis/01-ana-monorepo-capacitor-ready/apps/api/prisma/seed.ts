import { PrismaClient, TenantStatus, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: { name: "Demo Tenant", status: TenantStatus.ACTIVE },
    create: {
      slug: "demo",
      name: "Demo Tenant",
      status: TenantStatus.ACTIVE
    }
  });

  const permissions = [
    { key: "order:create", name: "Sipariş oluşturma" },
    { key: "order:read", name: "Sipariş görüntüleme" },
    { key: "tenant:manage", name: "Tenant yönetimi" }
  ] as const;

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: permission
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "admin" } },
    update: { name: "Yönetici" },
    create: {
      tenantId: tenant.id,
      code: "admin",
      name: "Yönetici"
    }
  });

  const salesRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "sales_rep" } },
    update: { name: "Saha Satış" },
    create: {
      tenantId: tenant.id,
      code: "sales_rep",
      name: "Saha Satış"
    }
  });

  const adminEmail = "admin@demo.local";
  const salesEmail = "satis@demo.local";
  const passwordHash = await hash("demo123", 10);

  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: { fullName: "Demo Yönetici", passwordHash, status: UserStatus.ACTIVE },
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      fullName: "Demo Yönetici",
      passwordHash,
      status: UserStatus.ACTIVE
    }
  });

  const salesUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: salesEmail } },
    update: { fullName: "Demo Satış", passwordHash, status: UserStatus.ACTIVE },
    create: {
      tenantId: tenant.id,
      email: salesEmail,
      fullName: "Demo Satış",
      passwordHash,
      status: UserStatus.ACTIVE
    }
  });

  const dbPermissions = await prisma.permission.findMany({
    where: { key: { in: permissions.map((permission) => permission.key) } }
  });

  for (const permission of dbPermissions) {
    const shouldAttachToAdmin = true;
    const shouldAttachToSales = permission.key !== "tenant:manage";

    if (shouldAttachToAdmin) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });
    }

    if (shouldAttachToSales) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: salesRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: salesRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: salesUser.id, roleId: salesRole.id } },
    update: {},
    create: { userId: salesUser.id, roleId: salesRole.id }
  });
}

void main().finally(async () => {
  await prisma.$disconnect();
});
