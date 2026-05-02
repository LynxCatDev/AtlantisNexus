import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { HealthResponse } from "../../common/types/health-response.type";

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getRoot(): HealthResponse {
    return {
      status: "ok",
      app: this.config.get<string>("app.name", "Atlantis Nexus API"),
      environment: this.config.get<string>("app.environment", "development"),
    };
  }
}
