import { Injectable } from "@nestjs/common";
import type { ItemContract } from "@saha-satis/contracts";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(tenantId: string): Promise<ItemContract[]> {
    const rows = await this.prismaService.itemCache.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      },
      include: {
        prices: {
          where: {
            tenantId
          },
          orderBy: {
            priceList: "asc"
          }
        }
      }
    });

    return rows.map((row) => ({
      id: row.id,
      itemCode: row.itemCode,
      name: row.name,
      barcode: row.barcode,
      stockSnapshot: row.stockSnapshot?.toString() ?? null,
      prices: row.prices.map((price) => ({
        priceList: price.priceList,
        currency: price.currency,
        unitPrice: price.unitPrice.toString()
      }))
    }));
  }
}
