import type { RiskLevel, StudentWithRisk } from "@/types";
import { RISK_LABELS } from "./RiskBadge";

const LEVELS: RiskLevel[] = ["alto", "medio", "baixo", "sem_dados"];

export function RiskCounters({ students }: { students: StudentWithRisk[] }) {
  return (
    <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {LEVELS.map((level) => (
        <div key={level} className="rounded-[15px] border border-slate-200 bg-white p-3">
          <dt className="text-sm text-slate-500">{RISK_LABELS[level]}</dt>
          <dd className="text-2xl font-semibold">
            {students.filter((student) => student.risk.level === level).length}
          </dd>
        </div>
      ))}
    </dl>
  );
}
