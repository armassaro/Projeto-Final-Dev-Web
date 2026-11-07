"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready) router.replace(user ? "/painel/" : "/login/");
  }, [ready, user, router]);

  return <p className="p-4 text-sm text-slate-500">Carregando...</p>;
}
