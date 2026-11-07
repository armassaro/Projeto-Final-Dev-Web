"use client";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useForm } from "@/hooks/useForm";

export type ClassroomFormValues = { name: string; subject: string; year: number };

type ClassroomFormProps = {
  onSave: (values: ClassroomFormValues) => void;
};

export function ClassroomForm({ onSave }: ClassroomFormProps) {
  const { bind, handleSubmit } = useForm(
    { name: "", subject: "", year: String(new Date().getFullYear()) },
    (values) => ({
      name: values.name.trim() ? undefined : "Informe o nome da turma.",
      subject: values.subject.trim() ? undefined : "Informe a disciplina.",
      year: /^\d{4}$/.test(values.year) ? undefined : "Informe um ano válido.",
    }),
  );

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit((values) =>
        onSave({ name: values.name.trim(), subject: values.subject.trim(), year: Number(values.year) }),
      )}
    >
      <TextField label="Nome da turma" placeholder="Ex.: 9º ano A" {...bind("name")} />
      <TextField label="Disciplina" {...bind("subject")} />
      <TextField label="Ano letivo" inputMode="numeric" {...bind("year")} />
      <Button type="submit">Salvar turma</Button>
    </form>
  );
}
