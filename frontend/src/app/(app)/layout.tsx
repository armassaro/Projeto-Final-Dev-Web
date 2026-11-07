"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login/");
  }, [ready, user, router]);

  if (!user) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  return (
    <AppShell userName={user.name} onLogout={logout}>
      {children}
    </AppShell>
  );
}
