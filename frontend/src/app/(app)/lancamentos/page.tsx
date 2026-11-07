"use client";

import { useState } from "react";
import { AbsenceForm } from "@/components/records/AbsenceForm";
import { DeliveryForm } from "@/components/records/DeliveryForm";
import { GradeForm } from "@/components/records/GradeForm";
import { StudentRecordsView } from "@/components/records/StudentRecordsView";
import { RISK_LABELS } from "@/components/risk/RiskBadge";
import { RiskSummary } from "@/components/risk/RiskSummary";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { SelectField } from "@/components/ui/FormField";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { useData } from "@/contexts/DataContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { getSemesterRecords } from "@/services/risk";
import type { RiskLevel } from "@/types";

type RecordTab = "nota" | "falta" | "entrega";

const TABS: { value: RecordTab; label: string }[] = [
  { value: "nota", label: "Nota" },
  { value: "falta", label: "Falta" },
  { value: "entrega", label: "Entrega" },
];

type Feedback = { message: string; previousLevel: RiskLevel };

export default function RecordsPage() {
  const { addGrade, addAbsence, addDelivery } = useData();
  const { classrooms, students, getRecords } = useTeacherData();
  const [classroomId, setClassroomId] = useState<string>();
  const [studentId, setStudentId] = useState<string>();
  const [tab, setTab] = useState<RecordTab>("nota");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const classroom = classrooms.find((item) => item.id === classroomId) ?? classrooms[0];
  const classroomStudents = students.filter((item) => item.classroomId === classroom?.id);
  const student = classroomStudents.find((item) => item.id === studentId) ?? classroomStudents[0];

  function notify(message: string) {
    if (student) setFeedback({ message, previousLevel: student.risk.level });
  }

  return (
    <>
      <PageHeader
        title="Lançamentos"
        description="Registre notas, faltas e entregas. O risco é recalculado a cada lançamento."
      />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Turma"
            options={classrooms.map((item) => ({ value: item.id, label: item.name }))}
            value={classroom?.id ?? ""}
            onChange={(event) => {
              setClassroomId(event.target.value);
              setStudentId(undefined);
              setFeedback(null);
            }}
          />
          <SelectField
            label="Aluno"
            options={classroomStudents.map((item) => ({ value: item.id, label: item.name }))}
            value={student?.id ?? ""}
            onChange={(event) => {
              setStudentId(event.target.value);
              setFeedback(null);
            }}
          />
        </div>
      </Card>

      {!student ? (
        <p className="mt-4 text-sm text-slate-500">
          Cadastre um aluno na tela de turmas para fazer lançamentos.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-[22rem_1fr]">
          <Card title="Novo lançamento">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            {tab === "nota" && (
              <GradeForm
                key={student.id}
                studentId={student.id}
                onSave={(grade) => {
                  notify("Nota registrada.");
                  addGrade(grade);
                }}
              />
            )}
            {tab === "falta" && (
              <AbsenceForm
                key={student.id}
                studentId={student.id}
                onSave={(absence) => {
                  notify("Falta registrada.");
                  addAbsence(absence);
                }}
              />
            )}
            {tab === "entrega" && (
              <DeliveryForm
                key={student.id}
                studentId={student.id}
                onSave={(delivery) => {
                  notify("Entrega registrada.");
                  addDelivery(delivery);
                }}
              />
            )}
          </Card>
          <div className="min-w-0 space-y-4">
            {feedback && (
              <Alert tone="success">
                {feedback.message} Risco recalculado: {RISK_LABELS[feedback.previousLevel]} →{" "}
                {RISK_LABELS[student.risk.level]}.
              </Alert>
            )}
            <Card title={student.name}>
              <RiskSummary risk={student.risk} />
            </Card>
            <Card title="Registros do último semestre">
              <StudentRecordsView records={getSemesterRecords(getRecords(student.id))} />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
