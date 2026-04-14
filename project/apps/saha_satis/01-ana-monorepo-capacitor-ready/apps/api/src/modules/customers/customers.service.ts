import { Injectable } from "@nestjs/common";
import type { CustomerContract } from "@saha-satis/contracts";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(tenantId: string): Promise<CustomerContract[]> {
    const rows = await this.prismaService.customerCache.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      phone: row.phone,
      city: row.city,
      balance: row.balance?.toString() ?? null,
      creditLimit: row.creditLimit?.toString() ?? null
    }));
  }
}
