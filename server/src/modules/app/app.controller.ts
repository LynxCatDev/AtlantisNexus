import { Controller, Get } from "@nestjs/common";

import type { HealthResponse } from "../../common/types/health-response.type";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): HealthResponse {
    return this.appService.getRoot();
  }
}
