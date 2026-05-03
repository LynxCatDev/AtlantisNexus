export type Role = "USER" | "ADMIN" | "SUPERADMIN";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  nickname: string;
  password: string;
};

export type ArticleLocale = "en" | "ru" | "ro" | "es" | "de" | "fr";

export type Category = {
  id: string;
  slug: string;
  label: string;
  isMain: boolean;
  position: number;
};
