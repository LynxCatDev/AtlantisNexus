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

import "./Auth.scss";

export function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useTranslations("auth");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({
        email: email.trim(),
        nickname: nickname.trim(),
        password,
      });
      const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
      router.push(isStaff ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signupFailed"));
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

            <label className="field">
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
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span>{t("email")}</span>
              <span className="input-wrap">
                <MailIcon />
                <input
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span>{t("password")}</span>
              <PasswordField
                name="password"
                placeholder={t("passwordHint")}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={setPassword}
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

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
