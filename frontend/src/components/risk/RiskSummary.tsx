import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { RiskState } from "@/types";
import { RiskBadge } from "./RiskBadge";

type RiskSummaryProps = {
  risk: RiskState;
  onRetry?: () => void;
};

export function RiskSummary({ risk, onRetry }: RiskSummaryProps) {
  if (risk.status === "loading") {
    return (
      <div role="status" className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
        <Spinner />
        A IA está analisando o risco de evasão deste aluno...
      </div>
    );
  }

  if (risk.status === "error") {
    return (
      <div role="alert" className="space-y-2 rounded border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">
        <p>
          <span className="font-medium">Não foi possível calcular o risco de evasão.</span> {risk.message}
        </p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  const { assessment } = risk;
  return (
    <div className="space-y-2 text-sm">
      <p className="flex items-center gap-2">
        <span className="font-medium">Inteligência contra evasão escolar:</span>
        <RiskBadge level={assessment.level} />
        {assessment.level !== "sem_dados" && <span className="text-slate-500">{assessment.score}/100</span>}
      </p>
      <ul className="list-disc pl-5 text-slate-700">
        {assessment.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p>
        <span className="font-medium">Ação sugerida:</span> {assessment.suggestion}
      </p>
    </div>
  );
}
