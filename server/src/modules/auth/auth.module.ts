import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "../mail/mail.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EmailVerificationService } from "./email-verification.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret", "dev-access-secret-change-me"),
        signOptions: {
          expiresIn: config.get<string>("jwt.accessTtl", "15m") as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService, JwtStrategy],
  exports: [AuthService, EmailVerificationService],
})
export class AuthModule {}
