import { Injectable } from "@nestjs/common";

const SESSION_TTL_MS = 3 * 60 * 1000;
const MAX_SESSIONS = 50_000;

@Injectable()
export class PresenceService {
  private readonly sessions = new Map<string, number>();

  heartbeat(sessionKey: string): { online: number } {
    const now = Date.now();
    this.sessions.set(sessionKey, now);
    if (this.sessions.size > MAX_SESSIONS) {
      this.prune(now);
    }
    return { online: this.countActive(now) };
  }

  count(): { online: number } {
    return { online: this.countActive(Date.now()) };
  }

  private countActive(now: number): number {
    const cutoff = now - SESSION_TTL_MS;
    let active = 0;
    for (const lastSeen of this.sessions.values()) {
      if (lastSeen >= cutoff) active += 1;
    }
    return active;
  }

  private prune(now: number): void {
    const cutoff = now - SESSION_TTL_MS;
    for (const [key, lastSeen] of this.sessions.entries()) {
      if (lastSeen < cutoff) this.sessions.delete(key);
    }
  }
}
