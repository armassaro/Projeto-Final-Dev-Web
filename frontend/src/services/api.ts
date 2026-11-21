import type {
  Absence,
  Classroom,
  Delivery,
  Grade,
  ImportRow,
  Student,
  StudentRecords,
  Teacher,
} from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Define o token JWT enviado no cabeçalho Authorization das próximas requisições. */
export function setApiToken(token: string | null): void {
  authToken = token;
}

/** Função chamada quando a API recusa o token (vencido ou inválido). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export type AuthSession = {
  access_token: string;
  token_type: string;
  teacher: Teacher;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type ValidationIssue = { msg?: string };

function errorMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((issue: ValidationIssue) => issue.msg?.replace(/^Value error, /, ""))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  return status >= 500 ? "Erro no servidor. Tente novamente." : "Não foi possível concluir a operação.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  if (response.status === 401 && authToken) onUnauthorized?.();

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(body, response.status), response.status);
  return body as T;
}

const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });

export function describeError(error: unknown): string {
  return error instanceof ApiError ? error.message : "Erro inesperado.";
}

export const api = {
  login: (email: string, password: string) => post<AuthSession>("/auth/login", { email, password }),
  register: (input: { name: string; email: string; password: string }) =>
    post<AuthSession>("/auth/register", input),
  me: () => request<Teacher>("/auth/me"),

  listClassrooms: () => request<Classroom[]>("/turmas"),
  createClassroom: (input: Omit<Classroom, "id" | "teacherId">) =>
    post<Classroom>("/turmas", input),
  importRows: (classroomId: string, rows: ImportRow[]) =>
    post<{ added: number; duplicates: number }>(
      `/turmas/${encodeURIComponent(classroomId)}/importar`,
      rows.map((row) => ({ ...row, date: row.date || null })),
    ),

  listStudents: () => request<Student[]>("/alunos"),
  createStudent: (input: Omit<Student, "id">) => post<Student>("/alunos", input),
  updateStudent: (id: string, input: Partial<Omit<Student, "id">>) =>
    request<Student>(`/alunos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  listRecords: () => request<StudentRecords>("/lancamentos"),
  createGrade: (input: Omit<Grade, "id">) => post<Grade>("/notas", input),
  createAbsence: (input: Omit<Absence, "id">) => post<Absence>("/faltas", input),
  createDelivery: (input: Omit<Delivery, "id">) => post<Delivery>("/entregas", input),
};
