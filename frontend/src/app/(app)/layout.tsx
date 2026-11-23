"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const { loading, loaded, loadError, reload } = useData();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login/");
  }, [ready, user, router]);

  if (!user) {
    return (
      <p role="status" className="flex items-center gap-2 p-4 text-sm text-slate-500">
        <Spinner />
        Carregando...
      </p>
    );
  }

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
      {loading ? (
        // Evita mostrar listas vazias ("nenhuma turma") antes de os dados chegarem.
        <div role="status" className="flex items-center gap-2 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <Spinner />
          Carregando seus dados... Se o servidor estava inativo, isso pode levar até um minuto.
        </div>
      ) : (
        // Sem os dados, as páginas exibiriam listas vazias enganosas: mostra só o erro.
        loaded && children
      )}
    </AppShell>
  );
}
