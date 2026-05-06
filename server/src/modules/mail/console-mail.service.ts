import { Injectable, Logger } from "@nestjs/common";

import type { MailMessage, MailService } from "./mail.types";

@Injectable()
export class ConsoleMailService implements MailService {
  private readonly logger = new Logger("Mail");

  async send(message: MailMessage): Promise<void> {
    const lines = [
      "------ outgoing email ------",
      `to:      ${message.to}`,
      `subject: ${message.subject}`,
      "",
      message.text,
      "----------------------------",
    ];
    this.logger.log(`\n${lines.join("\n")}`);
  }
}
