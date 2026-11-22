/** Indicador de carregamento em linha (sem bloquear a tela). */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 ${className}`}
    />
  );
}
