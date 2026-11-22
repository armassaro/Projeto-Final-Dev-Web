import { Spinner } from "@/components/ui/Spinner";
import type { RiskState } from "@/types";
import { RiskBadge } from "./RiskBadge";

type RiskStatusBadgeProps = {
  risk: RiskState;
  onRetry?: () => void;
};

/** Selo de risco para tabelas: mostra o cálculo em andamento, a falha ou o nível. */
export function RiskStatusBadge({ risk, onRetry }: RiskStatusBadgeProps) {
  if (risk.status === "loading") {
    return (
      <span role="status" className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Spinner />
        Calculando...
      </span>
    );
  }

  if (risk.status === "error") {
    return (
      <span className="inline-flex items-center gap-2 text-xs" title={risk.message}>
        <span className="rounded border border-red-300 bg-red-50 px-2 py-0.5 font-medium text-red-700">
          Falha no cálculo
        </span>
        {onRetry && (
          <button
            type="button"
            className="text-slate-600 underline hover:text-slate-900"
            onClick={(event) => {
              event.stopPropagation();
              onRetry();
            }}
          >
            Tentar de novo
          </button>
        )}
      </span>
    );
  }

  return <RiskBadge level={risk.assessment.level} />;
}
