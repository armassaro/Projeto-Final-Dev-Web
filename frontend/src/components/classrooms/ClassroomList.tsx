import type { Classroom } from "@/types";

type ClassroomListProps = {
  classrooms: Classroom[];
  selectedId?: string;
  studentCount: (classroomId: string) => number;
  onSelect: (classroomId: string) => void;
};

export function ClassroomList({ classrooms, selectedId, studentCount, onSelect }: ClassroomListProps) {
  return (
    <ul className="space-y-2">
      {classrooms.map((classroom) => (
        <li key={classroom.id}>
          <button
            type="button"
            aria-pressed={classroom.id === selectedId}
            onClick={() => onSelect(classroom.id)}
            className={`w-full rounded border px-3 py-2 text-left text-sm ${
              classroom.id === selectedId ? "border-slate-800 bg-slate-100" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="block font-medium">{classroom.name}</span>
            <span className="text-slate-500">
              {classroom.subject} · {classroom.year} · {studentCount(classroom.id)} aluno(s)
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
