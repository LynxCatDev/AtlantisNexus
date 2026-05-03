"use client";

import { useState, type FormEvent } from "react";

import { ProfileIcon, SparkleIcon } from "@/components/Admin/adminIcons";
import { useAuth } from "@/components/Auth/AuthProvider";

export function AdminProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.nickname ?? "");
  const [username, setUsername] = useState(user?.nickname?.toLowerCase().replace(/\s+/g, "-") ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const resetForm = () => {
    setDisplayName(user?.nickname ?? "");
    setUsername(user?.nickname?.toLowerCase().replace(/\s+/g, "-") ?? "");
    setEmail(user?.email ?? "");
    setAvatarUrl("");
    setBio("");
    setNotice(null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Coming soon. Profile endpoints are not wired yet.");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <p className="eyebrow eyebrow-cyan">Profile</p>
          <h1>Account settings</h1>
          <p>Profile editing is designed here and will connect once the backend endpoints exist.</p>
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
            {avatarUrl ? <span style={{ backgroundImage: `url(${avatarUrl})` }} /> : <ProfileIcon />}
          </span>
          <div>
            <h2 id="avatar-title">Avatar</h2>
            <p>Add a public image URL now. Upload storage comes later.</p>
          </div>
          <label className="admin-field">
            <span>Avatar URL</span>
            <input
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              type="url"
              value={avatarUrl}
            />
          </label>
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
    </div>
  );
}
