"use client";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useForm } from "@/hooks/useForm";
import type { Delivery } from "@/types";

type DeliveryFormProps = {
  studentId: string;
  onSave: (delivery: Omit<Delivery, "id">) => Promise<boolean>;
};

export function DeliveryForm({ studentId, onSave }: DeliveryFormProps) {
  const { bind, handleSubmit, reset, submitting } = useForm(
    { description: "", dueDate: "", deliveredAt: "" },
    (values) => ({
      description: values.description.trim() ? undefined : "Informe a atividade.",
      dueDate: values.dueDate ? undefined : "Informe o prazo.",
    }),
  );

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        const saved = await onSave({
          studentId,
          description: values.description.trim(),
          dueDate: values.dueDate,
          deliveredAt: values.deliveredAt || null,
        });
        // Só limpa o formulário se a API confirmou o registro.
        if (saved) reset();
      })}
    >
      <TextField label="Atividade" {...bind("description")} />
      <TextField label="Prazo" type="date" {...bind("dueDate")} />
      <TextField label="Data de entrega" type="date" hint="Deixe em branco se não foi entregue." {...bind("deliveredAt")} />
      <Button type="submit" loading={submitting} loadingText="Registrando...">Registrar entrega</Button>
    </form>
  );
}
