from .base import CamelModel
from .entregas import DeliveryRead
from .faltas import AbsenceRead
from .notas import GradeRead


class StudentRecords(CamelModel):
    grades: list[GradeRead]
    absences: list[AbsenceRead]
    deliveries: list[DeliveryRead]
