from datetime import date
from pydantic import field_validator

from .base import CamelModel


class AbsenceBase(CamelModel):
    student_id: str
    date: date

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Informe uma data que não esteja no futuro.")
        return value


class AbsenceCreate(AbsenceBase):
    pass


class AbsenceRead(AbsenceBase):
    id: str