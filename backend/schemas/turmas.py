from pydantic import Field, field_validator

from .base import CamelModel


class ClassroomBase(CamelModel):
    name: str = Field(min_length=1, max_length=32)
    subject: str = Field(min_length=1, max_length=32)
    year: int = Field(ge=1900, le=2100)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Informe o nome da turma.")
        return value
    
    @field_validator("subject")
    @classmethod
    def subject_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Informe a disciplina da turma.")
        return value


class ClassroomCreate(ClassroomBase):
    pass


class ClassroomRead(ClassroomBase):
    id: str
    teacher_id: str
