"use client";

import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormField";
import { useForm } from "@/hooks/useForm";
import { parseDecimal, today } from "@/services/format";
import type { Grade, GradeType } from "@/types";

const TYPE_OPTIONS = [
  { value: "atividade", label: "Atividade" },
  { value: "prova", label: "Prova" },
];

type GradeFormProps = {
  studentId: string;
  onSave: (grade: Omit<Grade, "id">) => void;
};

export function GradeForm({ studentId, onSave }: GradeFormProps) {
  const { bind, handleSubmit, reset } = useForm(
    { type: "atividade", description: "", value: "", date: today() },
    (values) => {
      const value = parseDecimal(values.value);
      return {
        description: values.description.trim() ? undefined : "Informe a descrição.",
        value: value >= 0 && value <= 10 ? undefined : "A nota deve estar entre 0 e 10.",
        date: values.date && values.date <= today() ? undefined : "Informe uma data que não esteja no futuro.",
      };
    },
  );

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        onSave({
          studentId,
          type: values.type as GradeType,
          description: values.description.trim(),
          value: parseDecimal(values.value),
          date: values.date,
        });
        reset();
      })}
    >
      <SelectField label="Tipo" options={TYPE_OPTIONS} {...bind("type")} />
      <TextField label="Descrição" {...bind("description")} />
      <TextField label="Nota (0 a 10)" inputMode="decimal" {...bind("value")} />
      <TextField label="Data" type="date" {...bind("date")} />
      <Button type="submit">Registrar nota</Button>
    </form>
  );
}
