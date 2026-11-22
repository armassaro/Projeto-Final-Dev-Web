"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useRiskAssessments } from "@/hooks/useRiskAssessments";
import type { StudentRecords, StudentWithRisk } from "@/types";

export function useTeacherData() {
  const { user } = useAuth();
  const { data } = useData();

  const classrooms = useMemo(
    () => data.classrooms.filter((classroom) => classroom.teacherId === user?.id),
    [data.classrooms, user?.id],
  );

  const getRecords = useCallback(
    (studentId: string): StudentRecords => ({
      grades: data.grades.filter((grade) => grade.studentId === studentId),
      absences: data.absences.filter((absence) => absence.studentId === studentId),
      deliveries: data.deliveries.filter((delivery) => delivery.studentId === studentId),
    }),
    [data.grades, data.absences, data.deliveries],
  );

  const ownStudents = useMemo(() => {
    const ids = new Set(classrooms.map((classroom) => classroom.id));
    return data.students.filter((student) => ids.has(student.classroomId));
  }, [data.students, classrooms]);

  // O risco de cada aluno é calculado pela IA na API, a cada visita à página.
  const { getRisk, retry: retryRisk } = useRiskAssessments(ownStudents, getRecords, user?.id);

  const students = useMemo<StudentWithRisk[]>(() => {
    const names = new Map(classrooms.map((classroom) => [classroom.id, classroom.name]));
    return ownStudents
      .map((student) => {
        const grades = getRecords(student.id).grades;
        return {
          ...student,
          classroomName: names.get(student.classroomId) as string,
          average:
            grades.length > 0 ? grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length : null,
          risk: getRisk(student),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [ownStudents, classrooms, getRecords, getRisk]);

  return { classrooms, students, getRecords, retryRisk };
}
