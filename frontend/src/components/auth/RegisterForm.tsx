"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";

export function RegisterForm() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { bind, handleSubmit } = useForm(
    { name: "", email: "", password: "", confirmation: "" },
    (values) => ({
      name: values.name.trim() ? undefined : "Informe o nome.",
      email: /^\S+@\S+\.\S+$/.test(values.email.trim()) ? undefined : "Informe um e-mail válido.",
      password: values.password.length >= 6 ? undefined : "Use ao menos 6 caracteres.",
      confirmation: values.confirmation === values.password ? undefined : "As senhas não coincidem.",
    }),
  );

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit(({ name, email, password }) =>
        setError(register({ name, email, password })),
      )}
    >
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Nome" autoComplete="name" {...bind("name")} />
      <TextField label="E-mail" type="email" autoComplete="email" {...bind("email")} />
      <TextField label="Senha" type="password" autoComplete="new-password" {...bind("password")} />
      <TextField label="Confirmar senha" type="password" autoComplete="new-password" {...bind("confirmation")} />
      <Button type="submit" className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
