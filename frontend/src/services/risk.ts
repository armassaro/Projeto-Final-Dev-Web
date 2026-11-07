import type {
  RiskAssessment,
  RiskLevel,
  Student,
  StudentRecords,
} from "@/types";
import { formatGrade } from "./format";

const SUGGESTIONS: Record<RiskLevel, string> = {
  baixo: "Manter o acompanhamento regular da turma.",
  medio:
    "Conversar com o aluno e propor atividades de reforço nas próximas semanas.",
  alto: "Conversar com o aluno e o responsável e acionar a coordenação pedagógica.",
  sem_dados: "Lançar as primeiras notas para que o risco possa ser calculado.",
};

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function semesterStart(records: StudentRecords): string | null {
  const dates = [
    ...records.grades.map((grade) => grade.date),
    ...records.absences.map((absence) => absence.date),
    ...records.deliveries.map((delivery) => delivery.deliveredAt ?? delivery.dueDate),
  ].sort();
  const latest = dates.at(-1);
  if (!latest) return null;
  const start = new Date(`${latest}T00:00:00Z`);
  start.setUTCMonth(start.getUTCMonth() - 6);
  return start.toISOString().slice(0, 10);
}

export function getSemesterRecords(records: StudentRecords): StudentRecords {
  const start = semesterStart(records);
  if (!start) return records;
  return {
    grades: records.grades.filter((grade) => grade.date >= start),
    absences: records.absences.filter((absence) => absence.date >= start),
    deliveries: records.deliveries.filter((delivery) => delivery.dueDate >= start),
  };
}

export function computeRisk(
  student: Student,
  records: StudentRecords,
): RiskAssessment {
  const semester = getSemesterRecords(records);

  if (semester.grades.length === 0) {
    return {
      level: "sem_dados",
      score: 0,
      average: null,
      reasons: ["Nenhuma nota lançada no último semestre."],
      suggestion: SUGGESTIONS.sem_dados,
    };
  }

  const reasons: string[] = [];
  const recentAverage = average(semester.grades.map((grade) => grade.value));
  const olderGrades = records.grades.filter(
    (grade) => !semester.grades.includes(grade),
  );
  const weightedAverage =
    olderGrades.length > 0
      ? recentAverage * 0.8 + average(olderGrades.map((grade) => grade.value)) * 0.2
      : recentAverage;

  let score = clamp((7 - weightedAverage) / 4) * 50;
  if (recentAverage < 7) {
    reasons.push(`Média ${formatGrade(recentAverage)} no último semestre.`);
  }

  const absences = semester.absences.length;
  score += clamp((absences - 2) / 10) * 20;
  if (absences > 2) reasons.push(`${absences} faltas no último semestre.`);

  const late = semester.deliveries.filter(
    (delivery) => delivery.deliveredAt && delivery.deliveredAt > delivery.dueDate,
  ).length;
  const missing = semester.deliveries.filter(
    (delivery) => !delivery.deliveredAt,
  ).length;
  if (semester.deliveries.length > 0) {
    score += clamp((late * 0.5 + missing) / semester.deliveries.length) * 15;
  }
  if (late > 0) reasons.push(`${late} entrega(s) com atraso.`);
  if (missing > 0) reasons.push(`${missing} entrega(s) não realizada(s).`);

  if (student.familyIncome !== null) {
    score += clamp((4000 - student.familyIncome) / 2500) * 5;
    if (student.familyIncome <= 1500) reasons.push("Renda familiar baixa.");
  }

  if (student.observationImpact === "aumenta") {
    score += 10;
    reasons.push("Observação do professor aumenta o risco.");
  }
  if (student.observationImpact === "reduz") {
    score -= 10;
    reasons.push("Observação do professor reduz o risco.");
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, score)));
  const level: RiskLevel =
    finalScore >= 50 ? "alto" : finalScore >= 25 ? "medio" : "baixo";

  return {
    level,
    score: finalScore,
    average: recentAverage,
    reasons: reasons.length > 0 ? reasons : ["Nenhum fator de atenção."],
    suggestion: SUGGESTIONS[level],
  };
}
