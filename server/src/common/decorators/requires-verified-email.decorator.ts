import { SetMetadata } from "@nestjs/common";

export const VERIFIED_EMAIL_KEY = "atlantis.verifiedEmail";

export const RequiresVerifiedEmail = () => SetMetadata(VERIFIED_EMAIL_KEY, true);
