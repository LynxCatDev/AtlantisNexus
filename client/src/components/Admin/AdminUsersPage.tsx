"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import type { Role } from "@/types/auth";

import "./AdminUsersPage.scss";

type AdminUser = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  avatar: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
};

type UsersResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

type RoleFilter = Role | "ALL";

const PAGE_SIZE = 20;
const roleFilters: RoleFilter[] = ["ALL", "USER", "ADMIN", "SUPERADMIN"];

export function AdminUsersPage() {
  const { authedFetch, user, status } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isSuperadmin = user?.role === "SUPERADMIN";

  useEffect(() => {
    if (status === "ready" && !isSuperadmin) {
      router.replace("/admin");
    }
  }, [status, isSuperadmin, router]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize],
  );

  const loadUsers = useCallback(
    async (cancelled: () => boolean) => {
      if (!isSuperadmin) return;
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const trimmed = query.trim();
      if (trimmed) params.set("q", trimmed);
      if (role !== "ALL") params.set("role", role);

      try {
        const next = await authedFetch<UsersResponse>(`/users?${params.toString()}`);
        if (!cancelled()) setData(next);
      } catch (err) {
        if (!cancelled()) {
          setError(err instanceof Error ? err.message : "Failed to load users.");
        }
      } finally {
        if (!cancelled()) setLoading(false);
      }
    },
    [authedFetch, isSuperadmin, page, query, role],
  );

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      void loadUsers(() => cancelled);
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [loadUsers]);

  const updateRole = async (target: AdminUser, nextRole: Role) => {
    setUpdatingId(target.id);
    setError(null);
    setNotice(null);
    try {
      await authedFetch<AdminUser>(`/users/${target.id}/role`, {
        method: "PATCH",
        body: { role: nextRole },
      });
      setNotice(`${target.nickname} is now ${nextRole}.`);
      await loadUsers(() => false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || !isSuperadmin) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-empty">Checking permissions...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard admin-users-page">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">Users</Eyebrow>
          <h1>User access</h1>
          <p>Promote verified users to admin and keep role changes explicit.</p>
        </div>
      </header>

      <section className="admin-users-toolbar" aria-label="User filters">
        <label className="admin-users-search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Email or nickname"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="admin-users-filter">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as RoleFilter);
              setPage(1);
            }}
          >
            {roleFilters.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "All roles" : item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      ) : null}

      <section className="admin-table-card" aria-busy={loading}>
        <div className="admin-table-head">
          <h2>Users</h2>
          <span>
            {data.total} total - page {data.page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty">Loading users...</div>
        ) : data.items.length > 0 ? (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Verified</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span
                            aria-hidden="true"
                            className="admin-user-avatar"
                            style={
                              item.avatar
                                ? {
                                    backgroundImage: `url(${item.avatar})`,
                                  }
                                : undefined
                            }
                          >
                            {item.avatar ? null : initials(item.nickname)}
                          </span>
                          <div>
                            <strong>{item.nickname}</strong>
                            <span>{item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td>
                        <span
                          className={
                            item.emailVerifiedAt
                              ? "admin-user-pill admin-user-pill--verified"
                              : "admin-user-pill admin-user-pill--unverified"
                          }
                        >
                          {item.emailVerifiedAt ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-user-pill admin-user-pill--${item.role.toLowerCase()}`}>
                          {item.role}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <div className="admin-actions">
                          {item.role === "USER" ? (
                            <button
                              className="admin-secondary-button"
                              disabled={!item.emailVerifiedAt || updatingId === item.id}
                              title={
                                item.emailVerifiedAt
                                  ? "Promote to admin"
                                  : "Email must be verified before promotion"
                              }
                              type="button"
                              onClick={() => void updateRole(item, "ADMIN")}
                            >
                              {updatingId === item.id ? "Saving" : "Make admin"}
                            </button>
                          ) : null}
                          {item.role === "ADMIN" ? (
                            <button
                              className="admin-danger-button"
                              disabled={updatingId === item.id}
                              type="button"
                              onClick={() => void updateRole(item, "USER")}
                            >
                              {updatingId === item.id ? "Saving" : "Remove admin"}
                            </button>
                          ) : null}
                          {item.role === "SUPERADMIN" ? (
                            <span className="admin-users-static-action">Protected</span>
                          ) : null}
                        </div>
                        {item.role === "USER" && !item.emailVerifiedAt ? (
                          <p className="admin-users-row-note">Verify email before promotion.</p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-users-pagination">
              <button
                type="button"
                className="admin-secondary-button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <span>
                Page {data.page} of {totalPages}
              </span>
              <button
                type="button"
                className="admin-secondary-button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="dashboard-empty">No users found.</div>
        )}
      </section>
    </div>
  );
}

function initials(value: string): string {
  return (value || "?").slice(0, 2).toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString();
}
