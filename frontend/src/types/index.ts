export type Teacher = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Classroom = {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  year: number;
};

export type ObservationImpact = "nenhum" | "aumenta" | "reduz";

export type Student = {
  id: string;
  classroomId: string;
  name: string;
  familyIncome: number | null;
  observations: string;
  observationImpact: ObservationImpact;
};

export type GradeType = "atividade" | "prova";

export type Grade = {
  id: string;
  studentId: string;
  type: GradeType;
  description: string;
  value: number;
  date: string;
};

export type Absence = {
  id: string;
  studentId: string;
  date: string;
};

export type Delivery = {
  id: string;
  studentId: string;
  description: string;
  dueDate: string;
  deliveredAt: string | null;
};

export type SchoolData = {
  classrooms: Classroom[];
  students: Student[];
  grades: Grade[];
  absences: Absence[];
  deliveries: Delivery[];
};

export type StudentRecords = {
  grades: Grade[];
  absences: Absence[];
  deliveries: Delivery[];
};

export type RiskLevel = "baixo" | "medio" | "alto" | "sem_dados";

export type RiskAssessment = {
  level: RiskLevel;
  score: number;
  average: number | null;
  reasons: string[];
  suggestion: string;
};

export type StudentWithRisk = Student & {
  classroomName: string;
  risk: RiskAssessment;
};

export type ImportRow = {
  position: number;
  studentName: string;
  type: GradeType | "falta" | "entrega";
  description: string;
  date: string;
  value: number | null;
  dueDate: string | null;
};
