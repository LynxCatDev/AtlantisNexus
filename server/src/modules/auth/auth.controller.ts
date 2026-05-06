import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import { normalizeRoutePrefix } from "../../common/utils/env.utils";

import { AuthService, IssuedTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

type AuthResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.auth.register(dto);
    this.setRefreshCookie(res, tokens);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.auth.login(dto);
    this.setRefreshCookie(res, tokens);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const cookieName = this.cookieName();
    const raw = req.cookies?.[cookieName];
    const tokens = await this.auth.refresh(raw);
    this.setRefreshCookie(res, tokens);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const cookieName = this.cookieName();
    const raw = req.cookies?.[cookieName];
    await this.auth.logout(raw);
    res.clearCookie(cookieName, this.refreshCookieOptions(0));
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.auth.verifyEmail(dto.token);
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<void> {
    await this.auth.resendVerification(dto.email);
  }

  @Get("session")
  @UseGuards(JwtAuthGuard)
  validateSession(@CurrentUser() user: AuthenticatedUser): { user: AuthenticatedUser } {
    return { user: this.auth.validateSession(user) };
  }

  private cookieName(): string {
    return this.config.get<string>("jwt.refreshCookieName", "atlantis_refresh");
  }

  private setRefreshCookie(res: Response, tokens: IssuedTokens): void {
    const maxAge = tokens.refreshExpiresAt.getTime() - Date.now();
    res.cookie(this.cookieName(), tokens.refreshToken, this.refreshCookieOptions(maxAge));
  }

  private refreshCookieOptions(maxAge: number): CookieOptions {
    const env = this.config.get<string>("app.environment", "development");
    const isProd = env === "production";
    const apiPrefix = normalizeRoutePrefix(this.config.get<string>("app.apiPrefix", "/api/v1"));
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: `/${apiPrefix}/auth`,
      maxAge,
    };
  }
}
