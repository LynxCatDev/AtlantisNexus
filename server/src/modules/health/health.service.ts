import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

import type { HealthResponse } from "../../common/types/health-response.type";

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  getHealth(): HealthResponse {
    return this.buildHealthResponse();
  }

  async getDatabaseHealth(): Promise<HealthResponse> {
    try {
      await this.dataSource.query("SELECT 1");
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
