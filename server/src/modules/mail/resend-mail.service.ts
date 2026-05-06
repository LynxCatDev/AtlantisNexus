import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { MailMessage, MailService } from "./mail.types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

@Injectable()
export class ResendMailService implements MailService {
  private readonly logger = new Logger("ResendMail");

  constructor(private readonly config: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    const apiKey = this.config.get<string>("mail.resendApiKey");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const fromAddress = this.config.get<string>(
      "mail.fromAddress",
      "onboarding@resend.dev",
    );
    const fromName = this.config.get<string>("mail.fromName", "Atlantis Nexus");
    const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      this.logger.error(
        `Resend API ${res.status}: ${body || res.statusText}`,
      );
      throw new Error(`Resend API error: ${res.status}`);
    }
  }
}
