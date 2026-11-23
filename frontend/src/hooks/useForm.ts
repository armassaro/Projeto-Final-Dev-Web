"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  // Verdadeiro enquanto o envio (requisição à API) está em andamento.
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);

  function setField(field: keyof T, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function bind(field: keyof T) {
    return {
      value: values[field],
      error: errors[field],
      onChange: (event: { target: { value: string } }) =>
        setField(field, event.target.value),
    };
  }

  function handleSubmit(onValid: (values: T) => void | Promise<void>) {
    return async (event: FormEvent) => {
      event.preventDefault();
      // Ignora cliques repetidos enquanto o envio anterior não terminou.
      if (busy.current) return;
      const found = validate(values);
      setErrors(found);
      if (!Object.values(found).every((message) => !message)) return;

      busy.current = true;
      setSubmitting(true);
      try {
        await onValid(values);
      } finally {
        busy.current = false;
        setSubmitting(false);
      }
    };
  }

  function reset(next: T = initialValues) {
    setValues(next);
    setErrors({});
  }

  return { values, bind, handleSubmit, reset, submitting };
}
