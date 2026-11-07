"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { computeRisk } from "@/services/risk";
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

  const students = useMemo<StudentWithRisk[]>(() => {
    const names = new Map(classrooms.map((classroom) => [classroom.id, classroom.name]));
    return data.students
      .filter((student) => names.has(student.classroomId))
      .map((student) => ({
        ...student,
        classroomName: names.get(student.classroomId) as string,
        risk: computeRisk(student, getRecords(student.id)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [data.students, classrooms, getRecords]);

  return { classrooms, students, getRecords };
}
