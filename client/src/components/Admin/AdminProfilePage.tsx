"use client";

import {
  Check as CheckIcon,
  Sparkles as SparkleIcon,
  Trash2 as Trash2Icon,
  UserCircle as ProfileIcon,
  X as XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { AvatarUploadDialog } from "@/components/AvatarUpload/AvatarUploadDialog";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import type { AuthUser } from "@/types/auth";

export function AdminProfilePage() {
  const { user, setUser, authedFetch } = useAuth();
  const t = useTranslations("admin");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.nickname ?? "");
  const [username, setUsername] = useState(
    user?.nickname?.toLowerCase().replace(/\s+/g, "-") ?? "",
  );
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  const resetForm = () => {
    setDisplayName(user?.nickname ?? "");
    setUsername(user?.nickname?.toLowerCase().replace(/\s+/g, "-") ?? "");
    setEmail(user?.email ?? "");
    setBio("");
    setNotice(null);
  };

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
    setNotice(t("profileAvatarUpdated"));
  };

  const onRemoveAvatar = async () => {
    if (!user?.avatar) return;
    setRemovingAvatar(true);
    try {
      const updated = await authedFetch<AuthUser>("/users/me/avatar", { method: "DELETE" });
      setUser(updated);
      setNotice(t("profileAvatarRemoved"));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : t("profileAvatarRemoveFailed"));
    } finally {
      setRemovingAvatar(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(t("profileSavedSoon"));
  };

  const initials = (user?.nickname || "?").slice(0, 2).toUpperCase();

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">{t("profileEyebrow")}</Eyebrow>
          <h1>{t("profileTitle")}</h1>
          <p>{t("profileLede")}</p>
        </div>
      </header>

      {notice ? (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      ) : null}

      <form className="admin-profile-grid" onSubmit={onSubmit}>
        <section className="admin-card admin-avatar-card" aria-labelledby="avatar-title">
          <span className="admin-avatar-preview" aria-hidden="true">
            {user?.avatar ? (
              <span style={{ backgroundImage: `url(${user.avatar})` }} />
            ) : (
              <span className="admin-avatar-preview__initials">{initials}</span>
            )}
          </span>
          <div>
            <h2 id="avatar-title">{t("profileAvatarTitle")}</h2>
            <p>{t("profileAvatarDesc")}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={onPickFile}
          />
          <div className="admin-avatar-actions">
            <button
              type="button"
              className="admin-cta admin-cta-pill"
              onClick={() => fileRef.current?.click()}
            >
              {user?.avatar ? t("profileChangeAvatar") : t("profileUploadAvatar")}
            </button>
            {user?.avatar ? (
              <button
                type="button"
                className="admin-secondary-button"
                disabled={removingAvatar}
                onClick={onRemoveAvatar}
              >
                <Trash2Icon aria-hidden="true" size={16} />
                {removingAvatar ? t("profileRemovingAvatar") : t("profileRemove")}
              </button>
            ) : null}
          </div>
        </section>

        <div className="admin-profile-stack">
          <section className="admin-card" aria-labelledby="public-profile-title">
            <div className="admin-card-headline">
              <span className="stat-icon stat-primary">
                <ProfileIcon />
              </span>
              <div>
                <h2 id="public-profile-title">{t("profilePublicTitle")}</h2>
                <p>{t("profilePublicDesc")}</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span>{t("profileDisplayName")}</span>
                <input
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  value={displayName}
                />
              </label>
              <label className="admin-field">
                <span>{t("profileUsername")}</span>
                <input
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  value={username}
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>{t("profileBio")}</span>
                <textarea
                  onChange={(event) => setBio(event.target.value)}
                  placeholder={t("profileBioPlaceholder")}
                  rows={4}
                  value={bio}
                />
              </label>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="account-title">
            <div className="admin-card-headline">
              <span className="stat-icon stat-cyan">
                <SparkleIcon />
              </span>
              <div>
                <h2 id="account-title">{t("profileAccountTitle")}</h2>
                <p>{t("profileAccountDesc")}</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>{t("profileEmail")}</span>
                <input
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="admin-field">
                <span>{t("profileNewPassword")}</span>
                <input disabled placeholder={t("profileComingSoon")} type="password" />
              </label>
              <label className="admin-field">
                <span>{t("profileConfirmPassword")}</span>
                <input disabled placeholder={t("profileComingSoon")} type="password" />
              </label>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="preferences-title">
            <h2 id="preferences-title">{t("profilePreferences")}</h2>
            <div className="admin-toggle-list">
              <label className="admin-toggle">
                <input defaultChecked type="checkbox" />
                <span>{t("profilePrefDigest")}</span>
              </label>
              <label className="admin-toggle">
                <input defaultChecked type="checkbox" />
                <span>{t("profilePrefUpdates")}</span>
              </label>
              <label className="admin-toggle">
                <input type="checkbox" />
                <span>{t("profilePrefModeration")}</span>
              </label>
            </div>
          </section>

          <div className="admin-form-footer">
            <button className="admin-secondary-button" onClick={resetForm} type="button">
              <XIcon aria-hidden="true" size={16} />
              {t("profileCancel")}
            </button>
            <button className="admin-cta" type="submit">
              <CheckIcon aria-hidden="true" size={16} />
              {t("profileSave")}
            </button>
          </div>
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
