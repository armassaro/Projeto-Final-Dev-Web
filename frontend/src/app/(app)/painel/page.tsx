"use client";

import { useState } from "react";
import { RISK_LABELS, RiskBadge } from "@/components/risk/RiskBadge";
import { RiskCounters } from "@/components/risk/RiskCounters";
import { StudentDetail } from "@/components/students/StudentDetail";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { SelectField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTeacherData } from "@/hooks/useTeacherData";
import { formatGrade } from "@/services/format";
import type { RiskLevel, StudentWithRisk } from "@/types";

const LEVEL_ORDER: Record<RiskLevel, number> = { alto: 0, medio: 1, baixo: 2, sem_dados: 3 };

const COLUMNS: Column<StudentWithRisk>[] = [
  { header: "Aluno", render: (student) => student.name },
  { header: "Turma", render: (student) => student.classroomName },
  {
    header: "Média",
    render: (student) => (student.risk.average === null ? "-" : formatGrade(student.risk.average)),
  },
  { header: "Risco", render: (student) => <RiskBadge level={student.risk.level} /> },
  { header: "Ação sugerida", render: (student) => student.risk.suggestion },
];

const LEVEL_OPTIONS = [
  { value: "", label: "Todos os níveis" },
  ...(Object.keys(RISK_LABELS) as RiskLevel[]).map((level) => ({
    value: level,
    label: RISK_LABELS[level],
  })),
];

export default function RiskPanelPage() {
  const { classrooms, students, getRecords } = useTeacherData();
  const [classroomId, setClassroomId] = useState("");
  const [level, setLevel] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const inClassroom = students.filter(
    (student) => !classroomId || student.classroomId === classroomId,
  );
  const rows = inClassroom
    .filter((student) => !level || student.risk.level === level)
    .sort(
      (a, b) =>
        LEVEL_ORDER[a.risk.level] - LEVEL_ORDER[b.risk.level] || b.risk.score - a.risk.score,
    );
  const selected = students.find((student) => student.id === selectedId);

  return (
    <>
      <PageHeader
        title="Painel de risco"
        description="Veja quem precisa de atenção. Clique em um aluno para ver os detalhes."
      />
      <RiskCounters students={inClassroom} />
      <Card>
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Turma"
            options={[
              { value: "", label: "Todas as turmas" },
              ...classrooms.map((item) => ({ value: item.id, label: item.name })),
            ]}
            value={classroomId}
            onChange={(event) => setClassroomId(event.target.value)}
          />
          <SelectField
            label="Nível de risco"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          />
        </div>
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey={(student) => student.id}
          emptyMessage="Nenhum aluno encontrado com estes filtros."
          onRowClick={(student) => setSelectedId(student.id)}
        />
      </Card>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelectedId(null)}>
          <StudentDetail student={selected} records={getRecords(selected.id)} />
        </Modal>
      )}
    </>
  );
}
