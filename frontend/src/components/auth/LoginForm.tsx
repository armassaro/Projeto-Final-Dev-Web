"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { bind, handleSubmit } = useForm({ email: "", password: "" }, (values) => ({
    email: values.email.trim() ? undefined : "Informe o e-mail.",
    password: values.password ? undefined : "Informe a senha.",
  }));

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit((values) => setError(login(values.email, values.password)))}
    >
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="E-mail" type="email" autoComplete="email" {...bind("email")} />
      <TextField label="Senha" type="password" autoComplete="current-password" {...bind("password")} />
      <Button type="submit" className="w-full">
        Entrar
      </Button>
    </form>
  );
}
