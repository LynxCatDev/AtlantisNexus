import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { VERIFIED_EMAIL_KEY } from "../decorators/requires-verified-email.decorator";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(VERIFIED_EMAIL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException("Verify your email before posting comments or reactions");
    }

    return true;
  }
}
