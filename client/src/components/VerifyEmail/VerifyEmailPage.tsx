"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Header } from "@/components/Header/Header";
import { apiFetch } from "@/lib/api";

import "./VerifyEmailPage.scss";

type Status = "pending" | "success" | "error";

export function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const t = useTranslations("verifyEmail");
  const { refresh, user, status: authStatus } = useAuth();
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (authStatus !== "ready") return;
    ranRef.current = true;

    void (async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage(t("missingToken"));
        return;
      }

      try {
        await apiFetch<void>("/auth/verify-email", {
          method: "POST",
          body: { token },
        });
        if (user) {
          await refresh();
        }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : t("genericError"));
      }
    })();
  }, [authStatus, token, t, refresh, user]);

  return (
    <>
      <Header />
      <main className="verify-email">
        <section className="verify-email__card">
          {status === "pending" ? (
            <>
              <h1>{t("pendingTitle")}</h1>
              <p>{t("pendingCopy")}</p>
            </>
          ) : null}

          {status === "success" ? (
            <>
              <span className="verify-email__icon verify-email__icon--success" aria-hidden="true">
                ✓
              </span>
              <h1>{t("successTitle")}</h1>
              <p>{t("successCopy")}</p>
              <div className="verify-email__actions">
                <Link className="verify-email__cta" href={user ? "/dashboard/profile" : "/signin"}>
                  {user ? t("toDashboard") : t("toSignin")}
                </Link>
              </div>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <span className="verify-email__icon verify-email__icon--error" aria-hidden="true">
                !
              </span>
              <h1>{t("errorTitle")}</h1>
              <p>{errorMessage ?? t("genericError")}</p>
              <div className="verify-email__actions">
                <Link className="verify-email__cta" href={user ? "/dashboard/profile" : "/signin"}>
                  {user ? t("toDashboard") : t("toSignin")}
                </Link>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </>
  );
}
