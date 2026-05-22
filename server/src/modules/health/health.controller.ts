import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import type { HealthResponse } from "../../common/types/health-response.type";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Application health check" })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get("db")
  @ApiOperation({ summary: "Database connectivity health check" })
  async getDatabaseHealth(): Promise<HealthResponse> {
    return this.healthService.getDatabaseHealth();
  }
}
