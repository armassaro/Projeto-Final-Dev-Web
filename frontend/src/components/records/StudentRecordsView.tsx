import { DataTable } from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { formatDate, formatGrade } from "@/services/format";
import type { Absence, Delivery, Grade, StudentRecords } from "@/types";

const GRADE_COLUMNS: Column<Grade>[] = [
  { header: "Data", render: (grade) => formatDate(grade.date) },
  { header: "Tipo", render: (grade) => (grade.type === "prova" ? "Prova" : "Atividade") },
  { header: "Descrição", render: (grade) => grade.description },
  { header: "Nota", render: (grade) => formatGrade(grade.value) },
];

function deliveryStatus(delivery: Delivery): string {
  if (!delivery.deliveredAt) return "Não entregue";
  return delivery.deliveredAt > delivery.dueDate ? "Com atraso" : "No prazo";
}

const DELIVERY_COLUMNS: Column<Delivery>[] = [
  { header: "Atividade", render: (delivery) => delivery.description },
  { header: "Prazo", render: (delivery) => formatDate(delivery.dueDate) },
  { header: "Entregue em", render: (delivery) => (delivery.deliveredAt ? formatDate(delivery.deliveredAt) : "-") },
  { header: "Situação", render: deliveryStatus },
];

const ABSENCE_COLUMNS: Column<Absence>[] = [
  { header: "Data", render: (absence) => formatDate(absence.date) },
];

function byDateDesc<T>(items: T[], date: (item: T) => string): T[] {
  return [...items].sort((a, b) => date(b).localeCompare(date(a)));
}

export function StudentRecordsView({ records }: { records: StudentRecords }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Notas</h3>
        <DataTable
          columns={GRADE_COLUMNS}
          rows={byDateDesc(records.grades, (grade) => grade.date)}
          rowKey={(grade) => grade.id}
          emptyMessage="Nenhuma nota no período."
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold">Entregas</h3>
        <DataTable
          columns={DELIVERY_COLUMNS}
          rows={byDateDesc(records.deliveries, (delivery) => delivery.dueDate)}
          rowKey={(delivery) => delivery.id}
          emptyMessage="Nenhuma entrega no período."
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold">Faltas ({records.absences.length})</h3>
        <DataTable
          columns={ABSENCE_COLUMNS}
          rows={byDateDesc(records.absences, (absence) => absence.date)}
          rowKey={(absence) => absence.id}
          emptyMessage="Nenhuma falta no período."
        />
      </div>
    </div>
  );
}
