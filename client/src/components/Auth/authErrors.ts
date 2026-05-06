import { ApiError } from "@/lib/api";

type Translator = (key: string) => string;

export type SigninFieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export type SignupFieldErrors = {
  email?: string;
  nickname?: string;
  password?: string;
  form?: string;
};

export function getSigninErrors(error: unknown, t: Translator): SigninFieldErrors {
  if (isNetworkError(error)) {
    return { form: t("errorNetwork") };
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      const fields = parseValidationMessages(error, t);
      if (fields.email || fields.password) return fields;
      return { form: t("errorSigninValidation") };
    }
    if (error.status === 401) return { form: t("errorInvalidCredentials") };
    if (error.status === 429) return { form: t("errorTooManyAttempts") };
    if (error.status >= 500) return { form: t("errorServer") };
  }

  return { form: t("signinFailed") };
}

export function getSignupErrors(error: unknown, t: Translator): SignupFieldErrors {
  if (isNetworkError(error)) {
    return { form: t("errorNetwork") };
  }

  if (error instanceof ApiError) {
    const code = readCode(error);
    if (code === "EMAIL_TAKEN") return { email: t("errorEmailTaken") };
    if (code === "NICKNAME_TAKEN") return { nickname: t("errorNicknameTaken") };

    if (error.status === 400) {
      const fields = parseValidationMessages(error, t);
      if (fields.email || fields.password || fields.nickname) return fields;
      return { form: t("errorSignupValidation") };
    }
    if (error.status === 409) return { form: t("errorSignupConflict") };
    if (error.status === 429) return { form: t("errorTooManyAttempts") };
    if (error.status >= 500) return { form: t("errorServer") };
  }

  return { form: t("signupFailed") };
}

export function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function readCode(error: ApiError): string | null {
  const details = error.details;
  if (details && typeof details === "object" && "code" in details) {
    const value = (details as { code: unknown }).code;
    return typeof value === "string" ? value : null;
  }
  return null;
}

function parseValidationMessages(
  error: ApiError,
  t: Translator,
): SignupFieldErrors {
  const messages = readMessages(error);
  const out: SignupFieldErrors = {};
  for (const raw of messages) {
    const m = raw.toLowerCase();
    if (!out.email && m.includes("email")) {
      out.email = m.includes("must be an email") ? t("errorEmailInvalid") : raw;
    } else if (!out.nickname && m.includes("nickname")) {
      out.nickname = m.includes("shorter than") || m.includes("at least")
        ? t("errorNicknameTooShort")
        : raw;
    } else if (!out.password && m.includes("password")) {
      out.password = m.includes("shorter than") || m.includes("at least")
        ? t("errorPasswordTooShort")
        : raw;
    }
  }
  return out;
}

function readMessages(error: ApiError): string[] {
  const details = error.details;
  if (!details || typeof details !== "object") return [];
  const value = (details as { message?: unknown }).message;
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") return [value];
  return [];
}
