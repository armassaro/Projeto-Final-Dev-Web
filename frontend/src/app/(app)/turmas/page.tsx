"use client";

import { useState } from "react";
import { ClassroomForm } from "@/components/classrooms/ClassroomForm";
import { ClassroomList } from "@/components/classrooms/ClassroomList";
import { RiskStatusBadge } from "@/components/risk/RiskStatusBadge";
import { DataImport } from "@/components/students/DataImport";
import { StudentForm } from "@/components/students/StudentForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useData } from "@/contexts/DataContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { formatCurrency } from "@/services/format";
import type { Student, StudentWithRisk } from "@/types";

type ActiveModal =
  | { kind: "classroom" }
  | { kind: "student"; student?: Student }
  | null;

export default function ClassroomsPage() {
  const { addClassroom, saveStudent } = useData();
  const { classrooms, students, retryRisk } = useTeacherData();
  const [selectedId, setSelectedId] = useState<string>();
  const [modal, setModal] = useState<ActiveModal>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const selected = classrooms.find((classroom) => classroom.id === selectedId) ?? classrooms[0];
  const classroomStudents = students.filter((student) => student.classroomId === selected?.id);
  const classroomOptions = classrooms.map((classroom) => ({
    value: classroom.id,
    label: classroom.name,
  }));

  const columns: Column<StudentWithRisk>[] = [
    { header: "Nome", render: (student) => student.name },
    {
      header: "Renda familiar",
      render: (student) =>
        student.familyIncome === null ? "-" : formatCurrency(student.familyIncome),
    },
    { header: "Observações", render: (student) => student.observations || "-" },
    {
      header: "Risco",
      render: (student) => <RiskStatusBadge risk={student.risk} onRetry={() => retryRisk(student)} />,
    },
    {
      header: "Ações",
      render: (student) => (
        <Button variant="secondary" onClick={() => setModal({ kind: "student", student })}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Turmas e alunos"
        description="Cadastre turmas e alunos e importe dados de outros períodos."
        actions={<Button onClick={() => setModal({ kind: "classroom" })}>Nova turma</Button>}
      />
      {feedback && (
        <div className="mb-4">
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}
      {!selected ? (
        <Card>
          <p className="text-sm text-slate-500">Você ainda não tem turmas. Crie a primeira para começar.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
          <Card title="Turmas">
            <ClassroomList
              classrooms={classrooms}
              selectedId={selected.id}
              studentCount={(id) => students.filter((student) => student.classroomId === id).length}
              onSelect={setSelectedId}
            />
          </Card>
          <div className="min-w-0 space-y-4">
            <Card
              title={`Alunos: ${selected.name}`}
              actions={<Button onClick={() => setModal({ kind: "student" })}>Novo aluno</Button>}
            >
              <DataTable
                columns={columns}
                rows={classroomStudents}
                rowKey={(student) => student.id}
                emptyMessage="Nenhum aluno cadastrado nesta turma."
              />
            </Card>
            <Card title="Importar JSON">
              <DataImport key={selected.id} classroomId={selected.id} />
            </Card>
          </div>
        </div>
      )}

      {modal?.kind === "classroom" && (
        <Modal title="Nova turma" onClose={() => setModal(null)}>
          <ClassroomForm
            onSave={async (values) => {
              const error = await addClassroom(values);
              setFeedback(error ? { tone: "error", message: error } : { tone: "success", message: `Turma ${values.name} criada.` });
              setModal(null);
            }}
          />
        </Modal>
      )}
      {modal?.kind === "student" && selected && (
        <Modal title={modal.student ? "Editar aluno" : "Novo aluno"} onClose={() => setModal(null)}>
          <StudentForm
            student={modal.student}
            defaultClassroomId={selected.id}
            classroomOptions={classroomOptions}
            onSave={async (values) => {
              const error = await saveStudent(values);
              setFeedback(error ? { tone: "error", message: error } : { tone: "success", message: `Aluno ${values.name} salvo.` });
              setModal(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
