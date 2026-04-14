import { Injectable } from "@nestjs/common";
import type { BootstrapResponseContract } from "@saha-satis/contracts";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class BootstrapService {
  constructor(private readonly prismaService: PrismaService) {}

  async getData(
    tenantId: string,
    userId: string
  ): Promise<BootstrapResponseContract> {
    const [customerCount, itemCount, draftOrderCount] = await Promise.all([
      this.prismaService.customerCache.count({
        where: { tenantId, isActive: true }
      }),
      this.prismaService.itemCache.count({
        where: { tenantId, isActive: true }
      }),
      this.prismaService.draftOrder.count({
        where: { tenantId, userId }
      })
    ]);

    return {
      summary: {
        customerCount,
        itemCount,
        draftOrderCount
      }
    };
  }
}
