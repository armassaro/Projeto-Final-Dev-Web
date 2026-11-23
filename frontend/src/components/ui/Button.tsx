import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  /** Mostra o texto de envio e desabilita o botão enquanto a requisição está em andamento. */
  loading?: boolean;
  loadingText?: string;
};

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-slate-700",
  secondary: "border border-slate-300 bg-white transition-colors ease-in-out duration-300 hover:bg-primary hover:border-transparent hover:text-white",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  loading = false,
  loadingText = "Enviando...",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <div className="relative group overflow-hidden">
      <button
        type={type}
        className={`rounded px-3 py-2 text-sm font-medium disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? loadingText : children}
      </button>
    </div>
  );
}
