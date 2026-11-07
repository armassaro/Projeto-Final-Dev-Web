import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const VARIANTS = {
  primary: "bg-slate-800 text-white hover:bg-slate-700",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded px-3 py-2 text-sm font-medium disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
