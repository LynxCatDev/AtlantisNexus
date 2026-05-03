import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { LockIcon, MailIcon } from "@/components/Icons/Icons";

export function SigninPage() {
  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="sign-in-title">Welcome back</h1>
            <p>Sign in to keep building with Atlantis Nexus.</p>
          </div>

          <form className="auth-form">
            <button className="google-button" type="button">
              <span aria-hidden="true">G</span>
              Sign in with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <label className="field">
              <span>Email</span>
              <span className="input-wrap">
                <MailIcon />
                <input name="email" placeholder="you@domain.com" type="email" />
              </span>
            </label>

            <label className="field">
              <span>Password</span>
              <span className="input-wrap">
                <LockIcon />
                <input name="password" placeholder="Your password" type="password" />
              </span>
            </label>

            <button className="button auth-submit" type="submit">
              Sign in
            </button>

            <p className="legal-copy">
              <a href="#">Forgot your password?</a>
            </p>
          </form>

          <p className="auth-switch">
            New to Atlantis Nexus? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </section>

      <section className="community-panel" aria-label="Atlantis Nexus community">
        <div className="community-copy">
          <Link className="brand mini-brand" href="/" aria-label="Atlantis Nexus home">
            <span className="brand-mark">A</span>
            <span>Atlantis Nexus</span>
          </Link>
          <h2>
            Welcome back, <span>builder.</span>
          </h2>
          <ul>
            <li>Pick up where you left off</li>
            <li>Your bookmarks are waiting</li>
            <li>Continue conversations on articles</li>
            <li>Manage your tool history</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
