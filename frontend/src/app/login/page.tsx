"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    <div className="flex flex-col justify-center min-h-[530px] h-screen items-center">
      <main className="mx-auto max-w-sm p-4 pt-12 transition-all duration-300 ease-in-out">
        <h1 className="mb-1 text-xl font-semibold">Inteligência contra evasão escolar</h1>
        <p className="mb-4 text-sm text-slate-500">Acompanhamento de alunos para professores.</p>
        <Card>
          <Tabs tabs={TABS} active={mode} onChange={setMode} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {mode === "login" ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </Card>
        <p className="mt-3 text-xs text-slate-500">
          Conta de demonstração: helena@escola.edu.br / senha123
        </p>
      </main>
    </div>
  );
}
