import type { Absence, Delivery, Grade, ImportRow, SchoolData, Student } from "@/types";
import { createId } from "./format";

const VALID_TYPES = ["atividade", "prova", "falta", "entrega"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(text: string): boolean {
  return DATE_PATTERN.test(text) && !Number.isNaN(Date.parse(text));
}

function validateRow(row: ImportRow): string | null {
  if (!row.studentName) return "aluno não informado";
  if (!VALID_TYPES.includes(row.type)) return `tipo "${row.type}" inválido`;
  if (row.type === "entrega") {
    if (!row.description) return "entrega sem descrição";
    if (!row.dueDate || !isValidDate(row.dueDate)) return "prazo inválido";
    if (row.date && !isValidDate(row.date)) return "data inválida";
    return null;
  }
  if (!isValidDate(row.date)) return "data inválida";
  if (row.type === "falta") return null;
  if (!row.description) return "nota sem descrição";
  if (row.value === null || row.value < 0 || row.value > 10) {
    return "nota deve ser um número entre 0 e 10";
  }
  return null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseImportJson(content: string): { rows: ImportRow[]; errors: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/^\uFEFF/, ""));
  } catch {
    return { rows: [], errors: ["O arquivo não é um JSON válido."] };
  }
  if (!Array.isArray(parsed)) {
    return { rows: [], errors: ["O arquivo deve conter uma lista de registros."] };
  }

  const rows: ImportRow[] = [];
  const errors: string[] = [];
  parsed.forEach((item: unknown, index) => {
    const record = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const row: ImportRow = {
      position: index + 1,
      studentName: text(record.aluno),
      type: text(record.tipo).toLowerCase() as ImportRow["type"],
      description: text(record.descricao),
      date: text(record.data),
      value: typeof record.nota === "number" ? record.nota : null,
      dueDate: text(record.prazo) || null,
    };
    const error = validateRow(row);
    if (error) errors.push(`Registro ${row.position}: ${error}.`);
    else rows.push(row);
  });
  return { rows, errors };
}

export type ImportPatch = {
  students: Student[];
  grades: Grade[];
  absences: Absence[];
  deliveries: Delivery[];
  added: number;
  duplicates: number;
};

export function buildImportPatch(
  data: SchoolData,
  classroomId: string,
  rows: ImportRow[],
): ImportPatch {
  const patch: ImportPatch = {
    students: [],
    grades: [],
    absences: [],
    deliveries: [],
    added: 0,
    duplicates: 0,
  };
  const known = new Map(
    data.students
      .filter((student) => student.classroomId === classroomId)
      .map((student) => [student.name.toLowerCase(), student.id]),
  );
  const seen = new Set<string>([
    ...data.grades.map((g) => `${g.studentId}|${g.type}|${g.description}|${g.date}|${g.value}`),
    ...data.absences.map((a) => `${a.studentId}|falta|${a.date}`),
    ...data.deliveries.map((d) => `${d.studentId}|entrega|${d.description}|${d.dueDate}`),
  ]);

  for (const row of rows) {
    const nameKey = row.studentName.toLowerCase();
    let studentId = known.get(nameKey);
    if (!studentId) {
      studentId = createId();
      known.set(nameKey, studentId);
      patch.students.push({
        id: studentId,
        classroomId,
        name: row.studentName,
        familyIncome: null,
        observations: "",
        observationImpact: "nenhum",
      });
    }

    let key: string;
    if (row.type === "falta") key = `${studentId}|falta|${row.date}`;
    else if (row.type === "entrega") key = `${studentId}|entrega|${row.description}|${row.dueDate}`;
    else key = `${studentId}|${row.type}|${row.description}|${row.date}|${row.value}`;
    if (seen.has(key)) {
      patch.duplicates++;
      continue;
    }
    seen.add(key);
    patch.added++;

    if (row.type === "falta") {
      patch.absences.push({ id: createId(), studentId, date: row.date });
    } else if (row.type === "entrega") {
      patch.deliveries.push({
        id: createId(),
        studentId,
        description: row.description,
        dueDate: row.dueDate as string,
        deliveredAt: row.date || null,
      });
    } else {
      patch.grades.push({
        id: createId(),
        studentId,
        type: row.type,
        description: row.description,
        value: row.value as number,
        date: row.date,
      });
    }
  }
  return patch;
}
