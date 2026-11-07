"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { mockData } from "@/data/mock";
import { buildImportPatch } from "@/services/import";
import { createId } from "@/services/format";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import type { Absence, Classroom, Delivery, Grade, ImportRow, SchoolData, Student } from "@/types";

const DATA_KEY = "evasao:dados";

type Action =
  | { type: "hydrate"; data: SchoolData }
  | { type: "addClassroom"; classroom: Classroom }
  | { type: "saveStudent"; student: Student }
  | { type: "merge"; patch: Pick<SchoolData, "students" | "grades" | "absences" | "deliveries"> };

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
          ? state.students.map((student) =>
              student.id === action.student.id ? action.student : student,
            )
          : [...state.students, action.student],
      };
    }
    case "merge":
      return {
        ...state,
        students: [...state.students, ...action.patch.students],
        grades: [...state.grades, ...action.patch.grades],
        absences: [...state.absences, ...action.patch.absences],
        deliveries: [...state.deliveries, ...action.patch.deliveries],
      };
  }
}

const EMPTY_PATCH = { students: [], grades: [], absences: [], deliveries: [] };

type DataContextValue = {
  data: SchoolData;
  addClassroom: (input: Omit<Classroom, "id">) => void;
  saveStudent: (input: Omit<Student, "id"> & { id?: string }) => void;
  addGrade: (input: Omit<Grade, "id">) => void;
  addAbsence: (input: Omit<Absence, "id">) => void;
  addDelivery: (input: Omit<Delivery, "id">) => void;
  importRows: (classroomId: string, rows: ImportRow[]) => { added: number; duplicates: number };
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, mockData);

  useEffect(() => {
    const stored = loadFromStorage<SchoolData>(DATA_KEY);
    if (stored) dispatch({ type: "hydrate", data: stored });
  }, []);

  useEffect(() => {
    if (data !== mockData) saveToStorage(DATA_KEY, data);
  }, [data]);

  const addClassroom = useCallback((input: Omit<Classroom, "id">) => {
    dispatch({ type: "addClassroom", classroom: { ...input, id: createId() } });
  }, []);

  const saveStudent = useCallback((input: Omit<Student, "id"> & { id?: string }) => {
    dispatch({ type: "saveStudent", student: { ...input, id: input.id ?? createId() } });
  }, []);

  const addGrade = useCallback((input: Omit<Grade, "id">) => {
    dispatch({ type: "merge", patch: { ...EMPTY_PATCH, grades: [{ ...input, id: createId() }] } });
  }, []);

  const addAbsence = useCallback((input: Omit<Absence, "id">) => {
    dispatch({ type: "merge", patch: { ...EMPTY_PATCH, absences: [{ ...input, id: createId() }] } });
  }, []);

  const addDelivery = useCallback((input: Omit<Delivery, "id">) => {
    dispatch({ type: "merge", patch: { ...EMPTY_PATCH, deliveries: [{ ...input, id: createId() }] } });
  }, []);

  const importRows = useCallback(
    (classroomId: string, rows: ImportRow[]) => {
      const patch = buildImportPatch(data, classroomId, rows);
      dispatch({ type: "merge", patch });
      return { added: patch.added, duplicates: patch.duplicates };
    },
    [data],
  );

  const value = useMemo(
    () => ({ data, addClassroom, saveStudent, addGrade, addAbsence, addDelivery, importRows }),
    [data, addClassroom, saveStudent, addGrade, addAbsence, addDelivery, importRows],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData deve ser usado dentro de DataProvider");
  return context;
}
