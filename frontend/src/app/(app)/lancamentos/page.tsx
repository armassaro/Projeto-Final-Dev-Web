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
import type { RiskLevel, RiskState } from "@/types";

type RecordTab = "nota" | "falta" | "entrega";

const TABS: { value: RecordTab; label: string }[] = [
  { value: "nota", label: "Nota" },
  { value: "falta", label: "Falta" },
  { value: "entrega", label: "Entrega" },
];

type Feedback = { message: string; previousLevel: RiskLevel | null };

function levelOf(risk: RiskState): RiskLevel | null {
  return risk.status === "ready" ? risk.assessment.level : null;
}

export default function RecordsPage() {
  const { addGrade, addAbsence, addDelivery } = useData();
  const { classrooms, students, getRecords, retryRisk } = useTeacherData();
  const [classroomId, setClassroomId] = useState<string>();
  const [studentId, setStudentId] = useState<string>();
  const [tab, setTab] = useState<RecordTab>("nota");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classroom = classrooms.find((item) => item.id === classroomId) ?? classrooms[0];
  const classroomStudents = students.filter((item) => item.classroomId === classroom?.id);
  const student = classroomStudents.find((item) => item.id === studentId) ?? classroomStudents[0];

  function notify(message: string) {
    setError(null);
    if (student) setFeedback({ message, previousLevel: levelOf(student.risk) });
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
              setError(null);
            }}
          />
          <SelectField
            label="Aluno"
            options={classroomStudents.map((item) => ({ value: item.id, label: item.name }))}
            value={student?.id ?? ""}
            onChange={(event) => {
              setStudentId(event.target.value);
              setFeedback(null);
              setError(null);
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
                onSave={async (grade) => {
                  const error = await addGrade(grade);
                  if (error) setError(error);
                  else notify("Nota registrada.");
                  return !error;
                }}
              />
            )}
            {tab === "falta" && (
              <AbsenceForm
                key={student.id}
                studentId={student.id}
                onSave={async (absence) => {
                  const error = await addAbsence(absence);
                  if (error) setError(error);
                  else notify("Falta registrada.");
                  return !error;
                }}
              />
            )}
            {tab === "entrega" && (
              <DeliveryForm
                key={student.id}
                studentId={student.id}
                onSave={async (delivery) => {
                  const error = await addDelivery(delivery);
                  if (error) setError(error);
                  else notify("Entrega registrada.");
                  return !error;
                }}
              />
            )}
          </Card>
          <div className="min-w-0 space-y-4">
            {error && <Alert tone="error">{error}</Alert>}
            {feedback && !error && (
              <Alert tone="success">
                {feedback.message}{" "}
                {student.risk.status === "loading" && "A IA está recalculando o risco..."}
                {student.risk.status === "ready" &&
                  (feedback.previousLevel
                    ? `Risco recalculado: ${RISK_LABELS[feedback.previousLevel]} → ${RISK_LABELS[student.risk.assessment.level]}.`
                    : `Risco recalculado: ${RISK_LABELS[student.risk.assessment.level]}.`)}
              </Alert>
            )}
            <Card title={student.name}>
              <RiskSummary risk={student.risk} onRetry={() => retryRisk(student)} />
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
