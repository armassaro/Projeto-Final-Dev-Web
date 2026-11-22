import type { StudentRecords } from "@/types";

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
