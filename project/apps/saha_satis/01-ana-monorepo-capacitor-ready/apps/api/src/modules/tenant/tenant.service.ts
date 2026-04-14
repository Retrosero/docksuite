import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class TenantService {
  constructor(private readonly prismaService: PrismaService) {}

  async resolveTenantBySlug(slug: string): Promise<{ id: string; slug: string }> {
    const tenant = await this.prismaService.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true }
    });

    if (!tenant) {
      throw new NotFoundException("Tenant bulunamadı.");
    }

    return tenant;
  }
}
