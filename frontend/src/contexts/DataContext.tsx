"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, describeError } from "@/services/api";
import type { Absence, Classroom, Delivery, Grade, ImportRow, SchoolData, Student } from "@/types";

const EMPTY_DATA: SchoolData = { classrooms: [], students: [], grades: [], absences: [], deliveries: [] };

type Action =
  | { type: "hydrate"; data: SchoolData }
  | { type: "addClassroom"; classroom: Classroom }
  | { type: "saveStudent"; student: Student }
  | { type: "addGrade"; grade: Grade }
  | { type: "addAbsence"; absence: Absence }
  | { type: "addDelivery"; delivery: Delivery };

function reducer(state: SchoolData, action: Action): SchoolData {
  switch (action.type) {
    case "hydrate":
      return action.data;
    case "addClassroom":
      return { ...state, classrooms: [...state.classrooms, action.classroom] };
    case "saveStudent": {
      const exists = state.students.some((student) => student.id === action.student.id);
      return {
        ...state,
        students: exists
          ? state.students.map((student) => (student.id === action.student.id ? action.student : student))
          : [...state.students, action.student],
      };
    }
    case "addGrade":
      return { ...state, grades: [...state.grades, action.grade] };
    case "addAbsence":
      return { ...state, absences: [...state.absences, action.absence] };
    case "addDelivery":
      return { ...state, deliveries: [...state.deliveries, action.delivery] };
  }
}

/** Resultado das operações: mensagem de erro, ou null em caso de sucesso. */
type Result = Promise<string | null>;
type ImportResult = { added: number; duplicates: number; error: string | null };

type DataContextValue = {
  data: SchoolData;
  loadError: string | null;
  reload: () => Promise<void>;
  addClassroom: (input: Omit<Classroom, "id" | "teacherId">) => Result;
  saveStudent: (input: Omit<Student, "id"> & { id?: string }) => Result;
  addGrade: (input: Omit<Grade, "id">) => Result;
  addAbsence: (input: Omit<Absence, "id">) => Result;
  addDelivery: (input: Omit<Delivery, "id">) => Result;
  importRows: (classroomId: string, rows: ImportRow[]) => Promise<ImportResult>;
};

async function fetchAll(): Promise<SchoolData> {
  const [classrooms, students, records] = await Promise.all([
    api.listClassrooms(),
    api.listStudents(),
    api.listRecords(),
  ]);
  return { classrooms, students, ...records };
}

const DataContext = createContext<DataContextValue | null>(null);

async function attempt(action: () => Promise<void>): Result {
  try {
    await action();
    return null;
  } catch (error) {
    return describeError(error);
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [data, dispatch] = useReducer(reducer, EMPTY_DATA);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      dispatch({ type: "hydrate", data: await fetchAll() });
      setLoadError(null);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, []);

  // Recarrega os dados sempre que o professor logado muda.
  useEffect(() => {
    let current = true;
    (userId ? fetchAll() : Promise.resolve(EMPTY_DATA))
      .then((loaded) => {
        if (!current) return;
        dispatch({ type: "hydrate", data: loaded });
        setLoadError(null);
      })
      .catch((error) => {
        if (current) setLoadError(describeError(error));
      });
    return () => {
      current = false;
    };
  }, [userId]);

  const addClassroom = useCallback(
    (input: Omit<Classroom, "id" | "teacherId">) =>
      attempt(async () => dispatch({ type: "addClassroom", classroom: await api.createClassroom(input) })),
    [],
  );

  const saveStudent = useCallback(
    ({ id, ...input }: Omit<Student, "id"> & { id?: string }) =>
      attempt(async () => {
        const student = id ? await api.updateStudent(id, input) : await api.createStudent(input);
        dispatch({ type: "saveStudent", student });
      }),
    [],
  );

  const addGrade = useCallback(
    (input: Omit<Grade, "id">) =>
      attempt(async () => dispatch({ type: "addGrade", grade: await api.createGrade(input) })),
    [],
  );

  const addAbsence = useCallback(
    (input: Omit<Absence, "id">) =>
      attempt(async () => dispatch({ type: "addAbsence", absence: await api.createAbsence(input) })),
    [],
  );

  const addDelivery = useCallback(
    (input: Omit<Delivery, "id">) =>
      attempt(async () => dispatch({ type: "addDelivery", delivery: await api.createDelivery(input) })),
    [],
  );

  const importRows = useCallback(
    async (classroomId: string, rows: ImportRow[]): Promise<ImportResult> => {
      try {
        const result = await api.importRows(classroomId, rows);
        await reload();
        return { ...result, error: null };
      } catch (error) {
        return { added: 0, duplicates: 0, error: describeError(error) };
      }
    },
    [reload],
  );

  const value = useMemo(
    () => ({
      data,
      loadError,
      reload,
      addClassroom,
      saveStudent,
      addGrade,
      addAbsence,
      addDelivery,
      importRows,
    }),
    [data, loadError, reload, addClassroom, saveStudent, addGrade, addAbsence, addDelivery, importRows],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData deve ser usado dentro de DataProvider");
  return context;
}
