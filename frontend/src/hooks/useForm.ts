"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

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

  function handleSubmit(onValid: (values: T) => void) {
    return (event: FormEvent) => {
      event.preventDefault();
      const found = validate(values);
      setErrors(found);
      if (Object.values(found).every((message) => !message)) onValid(values);
    };
  }

  function reset(next: T = initialValues) {
    setValues(next);
    setErrors({});
  }

  return { values, bind, handleSubmit, reset };
}
