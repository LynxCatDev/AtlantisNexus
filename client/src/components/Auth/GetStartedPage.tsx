import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { LockIcon, MailIcon, UserIcon } from "@/components/Icons/Icons";

export function GetStartedPage() {
  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="create-account-title">
        <div className="auth-form-shell">
          <BrandLogo className="auth-brand" />

          <div className="auth-heading">
            <h1 id="create-account-title">Create your account</h1>
            <p>Free forever. No credit card required.</p>
          </div>

          <form className="auth-form">
            <button className="google-button" type="button">
              <span aria-hidden="true">G</span>
              Sign up with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <label className="field">
              <span>Display name</span>
              <span className="input-wrap">
                <UserIcon />
                <input name="name" placeholder="Mira Voss" type="text" />
              </span>
            </label>

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
                <input name="password" placeholder="At least 8 characters" type="password" />
              </span>
            </label>

            <button className="button auth-submit" type="submit">
              Create account
            </button>

            <p className="legal-copy">
              By continuing, you agree to our <a href="#">Terms</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account? <a href="#">Sign in</a>
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
            Join a community of <span>builders.</span>
          </h2>
          <ul>
            <li>Bookmark articles across devices</li>
            <li>Comment and follow your favorite writers</li>
            <li>Save your tool history</li>
            <li>Early access to new features</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
