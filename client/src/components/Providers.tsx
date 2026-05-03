"use client";

import { AuthProvider } from "@/components/Auth/AuthProvider";
import { DevServiceWorkerCleanup } from "@/components/DevServiceWorkerCleanup";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DevServiceWorkerCleanup />
      {children}
    </AuthProvider>
  );
}
