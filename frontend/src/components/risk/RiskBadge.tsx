import type { RiskLevel } from "@/types";

export const RISK_LABELS: Record<RiskLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  sem_dados: "Sem dados",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  baixo: "bg-green-100 text-green-800",
  medio: "bg-yellow-100 text-yellow-800",
  alto: "bg-red-100 text-red-800",
  sem_dados: "bg-slate-100 text-slate-600",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${RISK_COLORS[level]}`}>
      {RISK_LABELS[level]}
    </span>
  );
}
