from fastapi import APIRouter, status

import storage
from auth.dependencies import CurrentTeacher
from routers.common import get_owned_classroom
from schemas.importacao import ImportResult, ImportRow
from schemas.turmas import ClassroomCreate, ClassroomRead

router = APIRouter(prefix="/turmas", tags=["Turmas"])


@router.get("", response_model=list[ClassroomRead])
def list_classrooms(teacher: CurrentTeacher):
    return storage.classrooms_of_teacher(teacher["id"])


@router.post("", response_model=ClassroomRead, status_code=status.HTTP_201_CREATED)
def create_classroom(classroom_data: ClassroomCreate, teacher: CurrentTeacher):
    new_classroom = {
        "id": storage.new_id(),
        "teacher_id": teacher["id"],
        **classroom_data.model_dump(),
    }
    storage.classrooms[new_classroom["id"]] = new_classroom
    return new_classroom


def _grade_key(student_id: str, grade_type: str, description: str, grade_date, value: float) -> tuple:
    return ("nota", student_id, grade_type, description, grade_date, float(value))


def _absence_key(student_id: str, absence_date) -> tuple:
    return ("falta", student_id, absence_date)


def _delivery_key(student_id: str, description: str, due_date) -> tuple:
    return ("entrega", student_id, description, due_date)


def _existing_record_keys() -> set[tuple]:
    keys = set()
    for grade in storage.grades.values():
        keys.add(_grade_key(grade["student_id"], grade["type"], grade["description"], grade["date"], grade["value"]))
    for absence in storage.absences.values():
        keys.add(_absence_key(absence["student_id"], absence["date"]))
    for delivery in storage.deliveries.values():
        keys.add(_delivery_key(delivery["student_id"], delivery["description"], delivery["due_date"]))
    return keys


def _row_key(student_id: str, row: ImportRow) -> tuple:
    if row.type == "falta":
        return _absence_key(student_id, row.date)
    if row.type == "entrega":
        return _delivery_key(student_id, row.description, row.due_date)
    return _grade_key(student_id, row.type, row.description, row.date, row.value)


def _find_or_create_student(student_name: str, classroom_id: str, student_ids_by_name: dict[str, str]) -> str:
    name_key = student_name.lower()
    if name_key in student_ids_by_name:
        return student_ids_by_name[name_key]

    new_student = {
        "id": storage.new_id(),
        "classroom_id": classroom_id,
        "name": student_name,
        "family_income": None,
        "observations": "",
        "observation_impact": "nenhum",
    }
    storage.students[new_student["id"]] = new_student
    student_ids_by_name[name_key] = new_student["id"]
    return new_student["id"]


def _save_row(student_id: str, row: ImportRow) -> None:
    record_id = storage.new_id()

    if row.type == "falta":
        storage.absences[record_id] = {
            "id": record_id,
            "student_id": student_id,
            "date": row.date,
        }
    elif row.type == "entrega":
        storage.deliveries[record_id] = {
            "id": record_id,
            "student_id": student_id,
            "description": row.description,
            "due_date": row.due_date,
            "delivered_at": row.date,
        }
    else:
        storage.grades[record_id] = {
            "id": record_id,
            "student_id": student_id,
            "type": row.type,
            "description": row.description,
            "value": row.value,
            "date": row.date,
        }


@router.post("/{classroom_id}/importar", response_model=ImportResult)
def import_records(classroom_id: str, rows: list[ImportRow], teacher: CurrentTeacher):
    get_owned_classroom(classroom_id, teacher)

    student_ids_by_name = {
        student["name"].lower(): student["id"]
        for student in storage.students_of_classroom(classroom_id)
    }
    saved_keys = _existing_record_keys()
    added = 0
    duplicates = 0

    for row in rows:
        student_id = _find_or_create_student(row.student_name, classroom_id, student_ids_by_name)
        key = _row_key(student_id, row)
        if key in saved_keys:
            duplicates += 1
            continue

        _save_row(student_id, row)
        saved_keys.add(key)
        added += 1

    return ImportResult(added=added, duplicates=duplicates)
