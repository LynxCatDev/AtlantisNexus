"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { ProfileIcon, SparkleIcon } from "@/components/Admin/adminIcons";
import { useAuth } from "@/components/Auth/AuthProvider";
import { AvatarUploadDialog } from "@/components/AvatarUpload/AvatarUploadDialog";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import type { AuthUser } from "@/types/auth";

export function AdminProfilePage() {
  const { user, setUser, authedFetch } = useAuth();
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
    setNotice("Avatar updated.");
  };

  const onRemoveAvatar = async () => {
    if (!user?.avatar) return;
    setRemovingAvatar(true);
    try {
      const updated = await authedFetch<AuthUser>("/users/me/avatar", { method: "DELETE" });
      setUser(updated);
      setNotice("Avatar removed.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Profile field saving will be wired up next.");
  };

  const initials = (user?.nickname || "?").slice(0, 2).toUpperCase();

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">Profile</Eyebrow>
          <h1>Account settings</h1>
          <p>Update your avatar and public profile.</p>
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
            <h2 id="avatar-title">Avatar</h2>
            <p>Upload an image (JPEG, PNG, or WebP up to 5 MB). You can crop it before saving.</p>
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
              {user?.avatar ? "Change avatar" : "Upload avatar"}
            </button>
            {user?.avatar ? (
              <button
                type="button"
                className="admin-secondary-button"
                disabled={removingAvatar}
                onClick={onRemoveAvatar}
              >
                {removingAvatar ? "Removing…" : "Remove"}
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
                <h2 id="public-profile-title">Public profile</h2>
                <p>Visible on authored articles and comments.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Display name</span>
                <input
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  value={displayName}
                />
              </label>
              <label className="admin-field">
                <span>Username</span>
                <input
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  value={username}
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>Bio</span>
                <textarea
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="A short public bio."
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
                <h2 id="account-title">Account</h2>
                <p>Email is required. Password changes will be added later.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>Email</span>
                <input
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="admin-field">
                <span>New password</span>
                <input disabled placeholder="Coming soon" type="password" />
              </label>
              <label className="admin-field">
                <span>Confirm password</span>
                <input disabled placeholder="Coming soon" type="password" />
              </label>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="preferences-title">
            <h2 id="preferences-title">Preferences</h2>
            <div className="admin-toggle-list">
              <label className="admin-toggle">
                <input defaultChecked type="checkbox" />
                <span>Weekly editorial digest</span>
              </label>
              <label className="admin-toggle">
                <input defaultChecked type="checkbox" />
                <span>Product updates</span>
              </label>
              <label className="admin-toggle">
                <input type="checkbox" />
                <span>Comment moderation alerts</span>
              </label>
            </div>
          </section>

          <div className="admin-form-footer">
            <button className="admin-secondary-button" onClick={resetForm} type="button">
              Cancel
            </button>
            <button className="admin-cta" type="submit">
              Save changes
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
