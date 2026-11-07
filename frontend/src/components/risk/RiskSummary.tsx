import type { RiskAssessment } from "@/types";
import { RiskBadge } from "./RiskBadge";

export function RiskSummary({ risk }: { risk: RiskAssessment }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="flex items-center gap-2">
        <span className="font-medium">Risco de evasão:</span>
        <RiskBadge level={risk.level} />
        {risk.level !== "sem_dados" && <span className="text-slate-500">{risk.score}/100</span>}
      </p>
      <ul className="list-disc pl-5 text-slate-700">
        {risk.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p>
        <span className="font-medium">Ação sugerida:</span> {risk.suggestion}
      </p>
    </div>
  );
}
