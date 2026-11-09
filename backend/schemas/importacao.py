from datetime import date as Date
from typing import Literal

from pydantic import Field, field_validator, model_validator

from .base import CamelModel

ImportType = Literal["atividade", "prova", "falta", "entrega"]


class ImportRow(CamelModel):
    position: int = Field(ge=1)
    student_name: str = Field(min_length=1, max_length=120)
    type: ImportType
    description: str = Field(default="", max_length=255)
    date: Date | None = None
    value: float | None = Field(default=None, ge=0, le=10)
    due_date: Date | None = None

    @field_validator("student_name", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("date", "due_date", mode="before")
    @classmethod
    def empty_date_to_none(cls, value):
        return None if value == "" else value

    @model_validator(mode="after")
    def check_required_by_type(self):
        if not self.student_name:
            raise ValueError("Aluno não informado.")
        if self.type == "entrega":
            if not self.description:
                raise ValueError("Entrega sem descrição.")
            if self.due_date is None:
                raise ValueError("Prazo inválido.")
            return self
        if self.date is None:
            raise ValueError("Data inválida.")
        if self.type == "falta":
            return self
        if not self.description:
            raise ValueError("Nota sem descrição.")
        if self.value is None:
            raise ValueError("Nota deve ser um número entre 0 e 10.")
        return self


class ImportResult(CamelModel):
    added: int = Field(ge=0)
    duplicates: int = Field(ge=0)
