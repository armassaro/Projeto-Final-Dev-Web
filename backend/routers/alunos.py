from fastapi import APIRouter, status

import storage
from auth.dependencies import CurrentTeacher
from routers.common import get_owned_classroom, get_owned_student
from schemas.alunos import StudentCreate, StudentRead, StudentUpdate
from schemas.lancamentos import StudentRecords

router = APIRouter(prefix="/alunos", tags=["Alunos"])

FIELDS_THAT_CANNOT_BE_NULL = ("name", "classroom_id", "observations", "observation_impact")


@router.get("", response_model=list[StudentRead])
def list_students(teacher: CurrentTeacher, classroom_id: str | None = None):
    if classroom_id is not None:
        get_owned_classroom(classroom_id, teacher)
        return storage.students_of_classroom(classroom_id)

    teacher_students = []
    for classroom in storage.classrooms_of_teacher(teacher["id"]):
        teacher_students.extend(storage.students_of_classroom(classroom["id"]))
    return teacher_students


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
def create_student(student_data: StudentCreate, teacher: CurrentTeacher):
    get_owned_classroom(student_data.classroom_id, teacher)

    new_student = {"id": storage.new_id(), **student_data.model_dump()}
    storage.students[new_student["id"]] = new_student
    return new_student


@router.get("/{student_id}", response_model=StudentRead)
def get_student(student_id: str, teacher: CurrentTeacher):
    return get_owned_student(student_id, teacher)


@router.patch("/{student_id}", response_model=StudentRead)
def update_student(student_id: str, student_data: StudentUpdate, teacher: CurrentTeacher):
    student = get_owned_student(student_id, teacher)

    changes = student_data.model_dump(exclude_unset=True)
    for field in FIELDS_THAT_CANNOT_BE_NULL:
        if field in changes and changes[field] is None:
            del changes[field]

    if "classroom_id" in changes:
        get_owned_classroom(changes["classroom_id"], teacher)

    student.update(changes)
    return student


@router.get("/{student_id}/lancamentos", response_model=StudentRecords)
def get_student_records(student_id: str, teacher: CurrentTeacher):
    get_owned_student(student_id, teacher)
    return storage.records_of_student(student_id)
