"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { GoogleIcon } from "@/components/Auth/GoogleIcon";
import { PasswordField } from "@/components/Auth/PasswordField";
import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { Button } from "@/components/Button/Button";
import { MailIcon, UserIcon } from "@/components/Icons/Icons";

import { getSignupErrors, isEmailLike, type SignupFieldErrors } from "./authErrors";
import "./Auth.scss";

export function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useTranslations("auth");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const onNicknameChange = (value: string) => {
    setNickname(value);
    if (errors.nickname || errors.form) setErrors((e) => ({ ...e, nickname: undefined, form: undefined }));
  };

  const onEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email || errors.form) setErrors((e) => ({ ...e, email: undefined, form: undefined }));
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password || errors.form) setErrors((e) => ({ ...e, password: undefined, form: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const next: SignupFieldErrors = {};
    if (trimmedNickname.length < 2) next.nickname = t("errorNicknameTooShort");
    if (!trimmedEmail) next.email = t("errorEmailRequired");
    else if (!isEmailLike(trimmedEmail)) next.email = t("errorEmailInvalid");
    if (!password) next.password = t("errorPasswordRequired");
    else if (password.length < 8) next.password = t("errorPasswordTooShort");

    if (next.nickname || next.email || next.password) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const user = await register({
        email: trimmedEmail,
        nickname: trimmedNickname,
        password,
      });
      const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
      router.push(isStaff ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      setErrors(getSignupErrors(err, t));
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="create-account-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="create-account-title">{t("signupTitle")}</h1>
            <p>{t("signupSubtitle")}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <button className="google-button" type="button" disabled>
              <GoogleIcon />
              {t("signupGoogle")}
            </button>

            <div className="divider">
              <span>{t("or")}</span>
            </div>

            <label className={`field${errors.nickname ? " field--error" : ""}`}>
              <span>{t("displayName")}</span>
              <span className="input-wrap">
                <UserIcon />
                <input
                  name="nickname"
                  placeholder={t("displayNamePlaceholder")}
                  type="text"
                  autoComplete="nickname"
                  required
                  minLength={2}
                  maxLength={32}
                  aria-invalid={Boolean(errors.nickname)}
                  aria-describedby={errors.nickname ? "signup-nickname-error" : undefined}
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                />
              </span>
              {errors.nickname ? (
                <span className="field-error" id="signup-nickname-error" role="alert">
                  {errors.nickname}
                </span>
              ) : null}
            </label>

            <label className={`field${errors.email ? " field--error" : ""}`}>
              <span>{t("email")}</span>
              <span className="input-wrap">
                <MailIcon />
                <input
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "signup-email-error" : undefined}
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
              </span>
              {errors.email ? (
                <span className="field-error" id="signup-email-error" role="alert">
                  {errors.email}
                </span>
              ) : null}
            </label>

            <label className={`field${errors.password ? " field--error" : ""}`}>
              <span>{t("password")}</span>
              <PasswordField
                name="password"
                placeholder={t("passwordHint")}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={onPasswordChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "signup-password-error" : undefined}
              />
              {errors.password ? (
                <span className="field-error" id="signup-password-error" role="alert">
                  {errors.password}
                </span>
              ) : null}
            </label>

            {errors.form ? <p className="auth-error" role="alert">{errors.form}</p> : null}

            <Button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? t("signupButtonLoading") : t("signupButton")}
            </Button>

            <p className="legal-copy">
              {t("legal")} <a href="#">{t("legalTerms")}</a> {t("legalAnd")}{" "}
              <a href="#">{t("legalPrivacy")}</a>.
            </p>
          </form>

          <p className="auth-switch">
            {t("haveAccount")} <Link href="/signin">{t("signinLink")}</Link>
          </p>
        </div>
      </section>

      <section
        className="community-panel community-mirror"
        aria-label="Atlantis Nexus community"
      >
        <div className="community-copy">
          <Link className="brand-logo brand-logo--mini" href="/" aria-label="Atlantis Nexus home">
            <span className="brand-logo__mark">A</span>
            <span>Atlantis Nexus</span>
          </Link>
          <h2>
            {t("signupCommunityTitleStart")} <span>{t("signupCommunityTitleAccent")}</span>.
          </h2>
          <ul>
            <li>{t("signupBenefit1")}</li>
            <li>{t("signupBenefit2")}</li>
            <li>{t("signupBenefit3")}</li>
            <li>{t("signupBenefit4")}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
