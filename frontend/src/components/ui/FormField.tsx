import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const CONTROL = "w-full rounded border bg-white px-3 py-2 text-sm";

function controlClass(error?: string) {
  return `${CONTROL} ${error ? "border-red-500" : "border-slate-300"}`;
}

type WrapperProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function FieldWrapper({ id, label, error, hint, children }: WrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

type BaseProps = { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <input id={id} className={controlClass(error)} {...props} />
    </FieldWrapper>
  );
}

export function TextAreaField({ label, error, hint, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <textarea id={id} rows={3} className={controlClass(error)} {...props} />
    </FieldWrapper>
  );
}

export type SelectOption = { value: string; label: string };

export function SelectField({ label, error, hint, options, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <select id={id} className={controlClass(error)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
