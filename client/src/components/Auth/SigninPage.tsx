"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { GoogleIcon } from "@/components/Auth/GoogleIcon";
import { PasswordField } from "@/components/Auth/PasswordField";
import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { MailIcon } from "@/components/Icons/Icons";

export function SigninPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="community-panel" aria-label="Atlantis Nexus community">
        <div className="community-copy">
          <Link className="brand mini-brand" href="/" aria-label="Atlantis Nexus home">
            <span className="brand-mark">A</span>
            <span>Atlantis Nexus</span>
          </Link>
          <h2>
            Welcome back to the <span>hub</span>.
          </h2>
          <p>
            Pick up where you left off — your bookmarks, comments and saved tools are all
            in sync.
          </p>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="sign-in-title">Sign in</h1>
            <p>to your Atlantis Nexus account</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <button className="google-button" type="button" disabled>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

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
              <span className="field-row">
                <span>Password</span>
                <a href="#">Forgot?</a>
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

            <button className="button auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New here?{" "}
            <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
