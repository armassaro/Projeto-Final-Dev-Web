import { Spinner } from "@/components/ui/Spinner";
import type { RiskLevel, StudentWithRisk } from "@/types";
import { RISK_LABELS } from "./RiskBadge";

const LEVELS: RiskLevel[] = ["alto", "medio", "baixo", "sem_dados"];

export function RiskCounters({ students }: { students: StudentWithRisk[] }) {
  const loading = students.filter((student) => student.risk.status === "loading").length;
  const failed = students.filter((student) => student.risk.status === "error").length;

  return (
    <div className="mb-4 space-y-2">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEVELS.map((level) => (
          <div key={level} className="rounded-[15px] border border-slate-200 bg-white p-3">
            <dt className="text-sm text-slate-500">{RISK_LABELS[level]}</dt>
            <dd className="text-2xl font-semibold">
              {
                students.filter(
                  (student) => student.risk.status === "ready" && student.risk.assessment.level === level,
                ).length
              }
            </dd>
          </div>
        ))}
      </dl>
      {loading > 0 && (
        <p role="status" className="flex items-center gap-2 text-sm text-slate-600">
          <Spinner />
          Calculando o risco de {loading} aluno(s) com a IA...
        </p>
      )}
      {failed > 0 && (
        <p className="text-sm text-red-700">
          Não foi possível calcular o risco de {failed} aluno(s). Use &quot;Tentar de novo&quot; na tabela.
        </p>
      )}
    </div>
  );
}
