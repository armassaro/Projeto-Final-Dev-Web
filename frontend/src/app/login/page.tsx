"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "login" | "cadastro";

const TABS: { value: Mode; label: string }[] = [
  { value: "login", label: "Entrar" },
  { value: "cadastro", label: "Cadastrar" },
];

export default function LoginPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  useEffect(() => {
    if (ready && user) router.replace("/painel/");
  }, [ready, user, router]);

  return (
    <main className="mx-auto max-w-sm p-4 pt-12">
      <h1 className="mb-1 text-xl font-semibold">Risco de Evasão</h1>
      <p className="mb-4 text-sm text-slate-500">Acompanhamento de alunos para professores.</p>
      <Card>
        <Tabs tabs={TABS} active={mode} onChange={setMode} />
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </Card>
      <p className="mt-3 text-xs text-slate-500">
        Conta de demonstração: helena@escola.edu.br / senha123
      </p>
    </main>
  );
}
