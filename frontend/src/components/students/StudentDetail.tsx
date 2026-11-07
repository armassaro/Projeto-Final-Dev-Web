import { StudentRecordsView } from "@/components/records/StudentRecordsView";
import { RiskSummary } from "@/components/risk/RiskSummary";
import { formatCurrency } from "@/services/format";
import { getSemesterRecords } from "@/services/risk";
import type { StudentRecords, StudentWithRisk } from "@/types";

type StudentDetailProps = {
  student: StudentWithRisk;
  records: StudentRecords;
};

export function StudentDetail({ student, records }: StudentDetailProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Turma {student.classroomName} · Renda familiar:{" "}
        {student.familyIncome === null ? "não informada" : formatCurrency(student.familyIncome)}
      </p>
      <RiskSummary risk={student.risk} />
      <div className="text-sm">
        <h3 className="font-semibold">Observações</h3>
        <p className="text-slate-700">{student.observations || "Nenhuma observação registrada."}</p>
      </div>
      <p className="text-sm font-semibold">Histórico do último semestre</p>
      <StudentRecordsView records={getSemesterRecords(records)} />
    </div>
  );
}
