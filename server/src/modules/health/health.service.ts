import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { HealthResponse } from "../../common/types/health-response.type";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getHealth(): HealthResponse {
    return this.buildHealthResponse();
  }

  async getDatabaseHealth(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.buildHealthResponse();
    } catch {
      throw new ServiceUnavailableException("Database is not reachable");
    }
  }

  private buildHealthResponse(): HealthResponse {
    return {
      status: "ok",
      app: this.config.get<string>("app.name", "Atlantis Nexus API"),
      environment: this.config.get<string>("app.environment", "development"),
    };
  }
}
