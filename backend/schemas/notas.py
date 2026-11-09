from datetime import date
from typing import Literal

from pydantic import Field, field_validator

from .base import CamelModel

GradeType = Literal["atividade", "prova"]


class GradeBase(CamelModel):
    student_id: str
    type: GradeType
    description: str = Field(min_length=1, max_length=255)
    value: float = Field(ge=0, le=10)
    date: date

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Informe a descrição.")
        return value

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Informe uma data que não esteja no futuro.")
        return value


class GradeCreate(GradeBase):
    pass


class GradeRead(GradeBase):
    id: str
