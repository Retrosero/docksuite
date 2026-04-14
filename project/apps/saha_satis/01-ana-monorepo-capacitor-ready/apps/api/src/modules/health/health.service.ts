import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHealth(): Promise<{ status: string; database: string }> {
    await this.prismaService.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      database: "bağlı"
    };
  }
}
