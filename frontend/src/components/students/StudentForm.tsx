"use client";

import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/FormField";
import type { SelectOption } from "@/components/ui/FormField";
import { useForm } from "@/hooks/useForm";
import { parseDecimal } from "@/services/format";
import type { ObservationImpact, Student } from "@/types";

const IMPACT_OPTIONS: SelectOption[] = [
  { value: "nenhum", label: "Não altera o risco" },
  { value: "aumenta", label: "Aumenta o risco" },
  { value: "reduz", label: "Reduz o risco" },
];

type StudentFormProps = {
  student?: Student;
  defaultClassroomId: string;
  classroomOptions: SelectOption[];
  onSave: (values: Omit<Student, "id"> & { id?: string }) => void;
};

export function StudentForm({ student, defaultClassroomId, classroomOptions, onSave }: StudentFormProps) {
  const { bind, handleSubmit } = useForm(
    {
      name: student?.name ?? "",
      classroomId: student?.classroomId ?? defaultClassroomId,
      familyIncome: student?.familyIncome?.toString() ?? "",
      observations: student?.observations ?? "",
      observationImpact: student?.observationImpact ?? "nenhum",
    },
    (values) => {
      const income = parseDecimal(values.familyIncome);
      return {
        name: values.name.trim() ? undefined : "Informe o nome do aluno.",
        familyIncome:
          values.familyIncome.trim() === "" || income >= 0 ? undefined : "Informe um valor válido.",
      };
    },
  );

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit((values) =>
        onSave({
          id: student?.id,
          name: values.name.trim(),
          classroomId: values.classroomId,
          familyIncome: values.familyIncome.trim() === "" ? null : parseDecimal(values.familyIncome),
          observations: values.observations.trim(),
          observationImpact: values.observationImpact as ObservationImpact,
        }),
      )}
    >
      <TextField label="Nome" {...bind("name")} />
      <SelectField label="Turma" options={classroomOptions} {...bind("classroomId")} />
      <TextField label="Renda familiar mensal (R$)" inputMode="decimal" hint="Opcional." {...bind("familyIncome")} />
      <TextAreaField label="Observações" {...bind("observations")} />
      <SelectField label="Efeito da observação no risco" options={IMPACT_OPTIONS} {...bind("observationImpact")} />
      <Button type="submit">Salvar aluno</Button>
    </form>
  );
}
