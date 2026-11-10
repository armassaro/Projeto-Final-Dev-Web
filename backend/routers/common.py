from fastapi import HTTPException, status

import storage


def _belongs_to_teacher(classroom: dict | None, teacher: dict) -> bool:
    return classroom is not None and classroom["teacher_id"] == teacher["id"]


def get_owned_classroom(classroom_id: str, teacher: dict) -> dict:
    classroom = storage.classrooms.get(classroom_id)
    if not _belongs_to_teacher(classroom, teacher):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada.")
    return classroom


def get_owned_student(student_id: str, teacher: dict) -> dict:
    student = storage.students.get(student_id)
    classroom = storage.classrooms.get(student["classroom_id"]) if student else None
    if not _belongs_to_teacher(classroom, teacher):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")
    return student
