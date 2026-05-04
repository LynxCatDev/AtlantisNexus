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
import { MailIcon } from "@/components/Icons/Icons";

import "./Auth.scss";

export function SigninPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
      router.push(isStaff ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signinFailed"));
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="community-panel" aria-label="Atlantis Nexus community">
        <div className="community-copy">
          <Link className="brand-logo brand-logo--mini" href="/" aria-label="Atlantis Nexus home">
            <span className="brand-logo__mark">A</span>
            <span>Atlantis Nexus</span>
          </Link>
          <h2>
            {t("communityTitleStart")} <span>{t("communityTitleAccent")}</span>.
          </h2>
          <p>{t("communityCopy")}</p>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="sign-in-title">{t("signinTitle")}</h1>
            <p>{t("signinSubtitle")}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <button className="google-button" type="button" disabled>
              <GoogleIcon />
              {t("continueGoogle")}
            </button>

            <div className="divider">
              <span>{t("or")}</span>
            </div>

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
              <span className="field-row">
                <span>{t("password")}</span>
                <a href="#">{t("forgot")}</a>
              </span>
              <PasswordField
                name="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={setPassword}
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <Button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? t("signinButtonLoading") : t("signinButton")}
            </Button>
          </form>

          <p className="auth-switch">
            {t("newHere")}{" "}
            <Link href="/signup">{t("createAccountLink")}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
