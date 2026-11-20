"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const { loadError, reload } = useData();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login/");
  }, [ready, user, router]);

  if (!user) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  return (
    <AppShell userName={user.name} onLogout={logout}>
      {loadError && (
        <div className="mb-4">
          <Alert tone="error">
            {loadError}{" "}
            <button type="button" className="underline" onClick={() => void reload()}>
              Tentar novamente
            </button>
          </Alert>
        </div>
      )}
      {children}
    </AppShell>
  );
}
