"use client";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useForm } from "@/hooks/useForm";
import { today } from "@/services/format";
import type { Absence } from "@/types";

type AbsenceFormProps = {
  studentId: string;
  onSave: (absence: Omit<Absence, "id">) => Promise<boolean>;
};

export function AbsenceForm({ studentId, onSave }: AbsenceFormProps) {
  const { bind, handleSubmit, reset, submitting } = useForm({ date: today() }, (values) => ({
    date: values.date && values.date <= today() ? undefined : "Informe uma data que não esteja no futuro.",
  }));

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        const saved = await onSave({ studentId, date: values.date });
        // Só limpa o formulário se a API confirmou o registro.
        if (saved) reset();
      })}
    >
      <TextField label="Data da falta" type="date" {...bind("date")} />
      <Button type="submit" loading={submitting} loadingText="Registrando...">Registrar falta</Button>
    </form>
  );
}
