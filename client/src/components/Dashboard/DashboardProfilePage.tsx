"use client";

import { useTranslations } from "next-intl";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { AvatarUploadDialog } from "@/components/AvatarUpload/AvatarUploadDialog";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

import "./DashboardProfilePage.scss";

type ProfilePatch = {
  nickname?: string;
};

export function DashboardProfilePage() {
  const { user, setUser, authedFetch } = useAuth();
  const t = useTranslations("dashboard.profileSection");
  const tCommon = useTranslations("dashboard");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    if (!user) return false;
    return nickname.trim() !== user.nickname;
  }, [user, nickname]);

  if (!user) return null;

  const initials = (user.nickname || "?").slice(0, 2).toUpperCase();
  const isVerified = Boolean(user.emailVerifiedAt);

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPickedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onUploaded = (updated: AuthUser) => {
    setUser(updated);
    setPickedImage(null);
    setNotice(t("avatarUpdated"));
    setError(null);
  };

  const onRemoveAvatar = async () => {
    if (!user.avatar) return;
    setRemovingAvatar(true);
    setError(null);
    try {
      const updated = await authedFetch<AuthUser>("/users/me/avatar", { method: "DELETE" });
      setUser(updated);
      setNotice(t("avatarRemoved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("avatarRemoveFailed"));
    } finally {
      setRemovingAvatar(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setNotice(null);
    setError(null);

    const patch: ProfilePatch = {};
    if (nickname.trim() !== user.nickname) patch.nickname = nickname.trim();

    try {
      const updated = await authedFetch<AuthUser>("/users/me", {
        method: "PATCH",
        body: patch,
      });
      setUser(updated);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setNickname(user.nickname);
    setNotice(null);
    setError(null);
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordNotice(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    setPasswordSaving(true);
    try {
      await authedFetch<void>("/users/me/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice(t("passwordSaved"));
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("passwordFailed"));
    } finally {
      setPasswordSaving(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setResendNotice(null);
    try {
      await apiFetch<void>("/auth/resend-verification", {
        method: "POST",
        body: { email: user.email },
      });
      setResendNotice(t("resentNotice"));
    } catch {
      setResendNotice(t("resendFailed"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="dashboard-profile">
      <header className="dashboard-profile__head">
        <Eyebrow className="eyebrow-cyan">{tCommon("profile")}</Eyebrow>
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </header>

      {!isVerified ? (
        <div className="dashboard-banner" role="status">
          <div>
            <strong>{t("unverifiedTitle")}</strong>
            <span>{t("unverifiedCopy")}</span>
            {resendNotice ? <span className="dashboard-banner__notice">{resendNotice}</span> : null}
          </div>
          <button
            type="button"
            className="dashboard-banner__action"
            disabled={resending}
            onClick={onResend}
          >
            {resending ? t("resending") : t("resend")}
          </button>
        </div>
      ) : null}

      {notice ? (
        <p className="dashboard-notice" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="dashboard-card" onSubmit={onSubmit}>
        <section className="dashboard-card__section dashboard-avatar">
          <div className="dashboard-avatar__preview" aria-hidden="true">
            {user.avatar ? (
              <span style={{ backgroundImage: `url(${user.avatar})` }} />
            ) : (
              <span className="dashboard-avatar__initials">{initials}</span>
            )}
          </div>
          <div className="dashboard-avatar__copy">
            <h2>{t("avatarTitle")}</h2>
            <p>{t("avatarHint")}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onPickFile}
            />
            <div className="dashboard-avatar__actions">
              <button
                type="button"
                className="dashboard-button dashboard-button--primary"
                onClick={() => fileRef.current?.click()}
              >
                {user.avatar ? t("avatarChange") : t("avatarUpload")}
              </button>
              {user.avatar ? (
                <button
                  type="button"
                  className="dashboard-button dashboard-button--ghost"
                  disabled={removingAvatar}
                  onClick={onRemoveAvatar}
                >
                  {removingAvatar ? t("avatarRemoving") : t("avatarRemove")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="dashboard-card__section">
          <h2>{t("identityTitle")}</h2>
          <div className="dashboard-fields">
            <label className="dashboard-field">
              <span>{t("nicknameLabel")}</span>
              <input
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={32}
                minLength={2}
                value={nickname}
              />
            </label>
            <label className="dashboard-field">
              <span>{t("emailLabel")}</span>
              <input
                readOnly
                required
                type="email"
                value={user.email}
              />
              <small>{t("emailHint")}</small>
            </label>
          </div>
        </section>

        <div className="dashboard-card__footer">
          <button
            type="button"
            className="dashboard-button dashboard-button--ghost"
            onClick={onCancel}
            disabled={!dirty || saving}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="dashboard-button dashboard-button--primary"
            disabled={!dirty || saving}
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </form>

      {passwordNotice ? (
        <p className="dashboard-notice" role="status">
          {passwordNotice}
        </p>
      ) : null}
      {passwordError ? (
        <p className="dashboard-error" role="alert">
          {passwordError}
        </p>
      ) : null}

      <form className="dashboard-card" onSubmit={onPasswordSubmit}>
        <section className="dashboard-card__section">
          <h2>{t("passwordTitle")}</h2>
          <p className="dashboard-section-copy">{t("passwordCopy")}</p>
          <div className="dashboard-fields dashboard-fields--password">
            <label className="dashboard-field">
              <span>{t("currentPasswordLabel")}</span>
              <input
                autoComplete="current-password"
                minLength={8}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                type="password"
                value={currentPassword}
              />
            </label>
            <label className="dashboard-field">
              <span>{t("newPasswordLabel")}</span>
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                type="password"
                value={newPassword}
              />
            </label>
            <label className="dashboard-field">
              <span>{t("confirmPasswordLabel")}</span>
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          </div>
        </section>

        <div className="dashboard-card__footer">
          <button
            type="submit"
            className="dashboard-button dashboard-button--primary"
            disabled={passwordSaving}
          >
            {passwordSaving ? t("passwordSaving") : t("passwordSave")}
          </button>
        </div>
      </form>

      {pickedImage ? (
        <AvatarUploadDialog
          imageSrc={pickedImage}
          onClose={() => setPickedImage(null)}
          onUploaded={onUploaded}
        />
      ) : null}
    </div>
  );
}
