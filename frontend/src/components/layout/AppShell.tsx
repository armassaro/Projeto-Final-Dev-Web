"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/painel/", label: "Painel de risco" },
  { href: "/turmas/", label: "Turmas e alunos" },
  { href: "/lancamentos/", label: "Lançamentos" },
];

type AppShellProps = {
  userName: string;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({ userName, onLogout, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="font-semibold">Risco de Evasão</span>
          <nav className="flex flex-wrap gap-3 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "font-semibold underline" : "text-slate-600 hover:underline"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-600">{userName}</span>
            <Button variant="secondary" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
