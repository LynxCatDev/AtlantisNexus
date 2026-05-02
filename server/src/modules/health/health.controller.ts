import { Controller, Get } from "@nestjs/common";

import type { HealthResponse } from "../../common/types/health-response.type";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get("db")
  async getDatabaseHealth(): Promise<HealthResponse> {
    return this.healthService.getDatabaseHealth();
  }
}
