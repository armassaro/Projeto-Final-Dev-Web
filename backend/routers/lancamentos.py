from fastapi import APIRouter, status

import storage
from auth.dependencies import CurrentTeacher
from routers.common import get_owned_student
from schemas.entregas import DeliveryCreate, DeliveryRead
from schemas.faltas import AbsenceCreate, AbsenceRead
from schemas.notas import GradeCreate, GradeRead

router = APIRouter(tags=["Lançamentos"])


@router.post("/notas", response_model=GradeRead, status_code=status.HTTP_201_CREATED)
def create_grade(grade_data: GradeCreate, teacher: CurrentTeacher):
    get_owned_student(grade_data.student_id, teacher)

    new_grade = {"id": storage.new_id(), **grade_data.model_dump()}
    storage.grades[new_grade["id"]] = new_grade
    return new_grade


@router.post("/faltas", response_model=AbsenceRead, status_code=status.HTTP_201_CREATED)
def create_absence(absence_data: AbsenceCreate, teacher: CurrentTeacher):
    get_owned_student(absence_data.student_id, teacher)

    new_absence = {"id": storage.new_id(), **absence_data.model_dump()}
    storage.absences[new_absence["id"]] = new_absence
    return new_absence


@router.post("/entregas", response_model=DeliveryRead, status_code=status.HTTP_201_CREATED)
def create_delivery(delivery_data: DeliveryCreate, teacher: CurrentTeacher):
    get_owned_student(delivery_data.student_id, teacher)

    new_delivery = {"id": storage.new_id(), **delivery_data.model_dump()}
    storage.deliveries[new_delivery["id"]] = new_delivery
    return new_delivery
