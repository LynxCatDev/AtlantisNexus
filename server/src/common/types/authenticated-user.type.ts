import type { Role } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  avatar: string | null;
};
