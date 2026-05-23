import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean;
  }

  override handleRequest<TUser>(err: unknown, user: TUser | false): TUser | null {
    if (err || !user) return null;
    return user;
  }
}
