"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
      setError(err instanceof Error ? err.message : "Sign up failed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="create-account-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="create-account-title">Create your account</h1>
            <p>Free forever. No credit card required.</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <button className="google-button" type="button" disabled>
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <label className="field">
              <span>Display name</span>
              <span className="input-wrap">
                <UserIcon />
                <input
                  name="nickname"
                  placeholder="Mira Voss"
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
              <span>Email</span>
              <span className="input-wrap">
                <MailIcon />
                <input
                  name="email"
                  placeholder="you@domain.com"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span>Password</span>
              <PasswordField
                name="password"
                placeholder="At least 8 characters"
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
              {submitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="legal-copy">
              By continuing, you agree to our <a href="#">Terms</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/signin">Sign in</Link>
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
            Join a community of <span>builders</span>.
          </h2>
          <ul>
            <li>Bookmark articles across devices</li>
            <li>Comment &amp; follow your favorite writers</li>
            <li>Save your tool history</li>
            <li>Early access to new features</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
