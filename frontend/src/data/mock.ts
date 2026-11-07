import type { Classroom, SchoolData, Student, Teacher } from "@/types";

export const mockTeachers: Teacher[] = [
  { id: "prof-1", name: "Helena Martins", email: "helena@escola.edu.br", password: "senha123" },
  { id: "prof-2", name: "Rafael Tavares", email: "rafael@escola.edu.br", password: "senha123" },
];

const classrooms: Classroom[] = [
  { id: "turma-1", teacherId: "prof-1", name: "9º ano A", subject: "Matemática", year: 2026 },
  { id: "turma-2", teacherId: "prof-1", name: "1ª série B", subject: "Matemática", year: 2026 },
  { id: "turma-3", teacherId: "prof-2", name: "8º ano C", subject: "História", year: 2026 },
];

type StudentSeed = {
  classroomId: string;
  name: string;
  income: number;
  activities: number[];
  exams: number[];
  previous: number;
  absences: number;
  late?: number;
  missing?: number;
  observations?: string;
  impact?: Student["observationImpact"];
};

const seeds: StudentSeed[] = [
  { classroomId: "turma-1", name: "Ana Clara Ferreira", income: 5200, activities: [9, 8.5, 9.5], exams: [8.5, 9], previous: 8.5, absences: 1 },
  { classroomId: "turma-1", name: "Bruno Henrique Costa", income: 2400, activities: [6, 5.5, 6.5], exams: [5, 5.5], previous: 6.5, absences: 5, late: 1 },
  { classroomId: "turma-1", name: "Camila Rocha Santos", income: 1400, activities: [4, 3.5, 3], exams: [3.5, 2.5], previous: 5, absences: 11, late: 1, missing: 1, observations: "Começou a trabalhar no período da tarde para ajudar em casa.", impact: "aumenta" },
  { classroomId: "turma-1", name: "Diego Almeida Nunes", income: 3100, activities: [7.5, 7, 8], exams: [7, 7.5], previous: 7, absences: 2 },
  { classroomId: "turma-1", name: "Eduarda Pereira Lima", income: 1800, activities: [5.5, 4.5, 5], exams: [5, 4], previous: 6, absences: 7, missing: 1 },
  { classroomId: "turma-1", name: "Felipe Gomes Barros", income: 4300, activities: [8, 8, 7.5], exams: [6.5, 7], previous: 7.5, absences: 3, late: 1, observations: "Participa do grupo de monitoria às quintas-feiras.", impact: "reduz" },
  { classroomId: "turma-2", name: "Gabriela Moreira Dias", income: 2900, activities: [7, 6.5, 7.5], exams: [6.5, 7], previous: 7, absences: 3 },
  { classroomId: "turma-2", name: "Heitor Vieira Campos", income: 1300, activities: [3, 4, 2.5], exams: [3, 2], previous: 4.5, absences: 12, missing: 2, observations: "Mudança recente de bairro; depende de dois ônibus para chegar à escola.", impact: "aumenta" },
  { classroomId: "turma-2", name: "Isabela Duarte Pinto", income: 6100, activities: [9.5, 10, 9], exams: [9, 9.5], previous: 9, absences: 0 },
  { classroomId: "turma-2", name: "João Pedro Cardoso", income: 2100, activities: [6, 5, 6], exams: [4.5, 5.5], previous: 6, absences: 6, late: 2 },
  { classroomId: "turma-3", name: "Larissa Teixeira Melo", income: 2600, activities: [7, 8, 7.5], exams: [7, 8], previous: 7.5, absences: 2 },
  { classroomId: "turma-3", name: "Matheus Ribeiro Farias", income: 1500, activities: [4.5, 4, 5], exams: [4, 3.5], previous: 5.5, absences: 9, missing: 1 },
];

const ACTIVITIES = [
  { description: "Lista de exercícios 1", date: "2026-08-14" },
  { description: "Trabalho em grupo", date: "2026-09-11" },
  { description: "Lista de exercícios 2", date: "2026-10-09" },
];
const EXAMS = [
  { description: "Prova do 3º bimestre", date: "2026-09-25" },
  { description: "Prova do 4º bimestre", date: "2026-10-30" },
];
const ABSENCE_DATES = [
  "2026-08-05", "2026-08-12", "2026-08-19", "2026-08-26", "2026-09-02", "2026-09-09",
  "2026-09-16", "2026-09-23", "2026-09-30", "2026-10-07", "2026-10-14", "2026-10-21",
];

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildMockData(): SchoolData {
  const data: SchoolData = {
    classrooms,
    students: [],
    grades: [],
    absences: [],
    deliveries: [],
  };

  seeds.forEach((seed, index) => {
    const studentId = `aluno-${index + 1}`;
    data.students.push({
      id: studentId,
      classroomId: seed.classroomId,
      name: seed.name,
      familyIncome: seed.income,
      observations: seed.observations ?? "",
      observationImpact: seed.impact ?? "nenhum",
    });

    data.grades.push({
      id: `${studentId}-anterior`,
      studentId,
      type: "prova",
      description: "Prova do 1º bimestre",
      value: seed.previous,
      date: "2026-03-27",
    });
    ACTIVITIES.forEach((activity, i) => {
      data.grades.push({
        id: `${studentId}-atividade-${i}`,
        studentId,
        type: "atividade",
        value: seed.activities[i],
        ...activity,
      });
    });
    EXAMS.forEach((exam, i) => {
      data.grades.push({
        id: `${studentId}-prova-${i}`,
        studentId,
        type: "prova",
        value: seed.exams[i],
        ...exam,
      });
    });

    ABSENCE_DATES.slice(0, seed.absences).forEach((date, i) => {
      data.absences.push({ id: `${studentId}-falta-${i}`, studentId, date });
    });

    const late = seed.late ?? 0;
    const missing = seed.missing ?? 0;
    ACTIVITIES.forEach((activity, i) => {
      const fromEnd = ACTIVITIES.length - 1 - i;
      let deliveredAt: string | null = activity.date;
      if (fromEnd < missing) deliveredAt = null;
      else if (fromEnd < missing + late) deliveredAt = addDays(activity.date, 4);
      data.deliveries.push({
        id: `${studentId}-entrega-${i}`,
        studentId,
        description: activity.description,
        dueDate: activity.date,
        deliveredAt,
      });
    });
  });

  return data;
}

export const mockData: SchoolData = buildMockData();
