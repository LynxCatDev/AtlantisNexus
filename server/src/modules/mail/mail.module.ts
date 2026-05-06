import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ConsoleMailService } from "./console-mail.service";
import type { MailService } from "./mail.types";
import { ResendMailService } from "./resend-mail.service";

export const MAIL_SERVICE = Symbol("MAIL_SERVICE");

@Module({
  providers: [
    ConsoleMailService,
    ResendMailService,
    {
      provide: MAIL_SERVICE,
      inject: [ConfigService, ConsoleMailService, ResendMailService],
      useFactory: (
        config: ConfigService,
        consoleMailer: ConsoleMailService,
        resendMailer: ResendMailService,
      ): MailService => {
        const driver = config.get<string>("mail.driver", "console");
        const logger = new Logger("MailModule");

        if (driver === "resend") {
          if (!config.get<string>("mail.resendApiKey")) {
            logger.warn(
              "MAIL_DRIVER=resend but RESEND_API_KEY is missing, falling back to console.",
            );
            return consoleMailer;
          }
          logger.log("Mail driver: resend");
          return resendMailer;
        }

        if (driver !== "console") {
          logger.warn(
            `Mail driver "${driver}" not implemented yet, falling back to console.`,
          );
        }

        logger.log("Mail driver: console");
        return consoleMailer;
      },
    },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
