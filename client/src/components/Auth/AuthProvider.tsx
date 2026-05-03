"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: "loading" | "ready";
};

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  authedFetch: <T>(path: string, init?: { method?: string; body?: unknown }) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    status: "loading",
  });
  const tokenRef = useRef<string | null>(null);

  const apply = useCallback((res: AuthResponse | null) => {
    tokenRef.current = res?.accessToken ?? null;
    setState({
      user: res?.user ?? null,
      accessToken: res?.accessToken ?? null,
      status: "ready",
    });
  }, []);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiFetch<AuthResponse>("/auth/refresh", { method: "POST" });
      apply(res);
      return res.user;
    } catch {
      apply(null);
      return null;
    }
  }, [apply]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: input,
      });
      apply(res);
      return res.user;
    },
    [apply],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: input,
      });
      apply(res);
      return res.user;
    },
    [apply],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors on logout
    }
    apply(null);
  }, [apply]);

  const authedFetch = useCallback(
    async <T,>(path: string, init?: { method?: string; body?: unknown }): Promise<T> => {
      const doFetch = (token: string | null) =>
        apiFetch<T>(path, {
          method: init?.method,
          body: init?.body,
          accessToken: token,
        });

      try {
        return await doFetch(tokenRef.current);
      } catch (err) {
        if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 401) {
          const refreshed = await apiFetch<AuthResponse>("/auth/refresh", { method: "POST" }).catch(
            () => null,
          );
          if (refreshed) {
            apply(refreshed);
            return doFetch(refreshed.accessToken);
          }
          apply(null);
        }
        throw err;
      }
    },
    [apply],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, refresh, authedFetch }),
    [state, login, register, logout, refresh, authedFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
