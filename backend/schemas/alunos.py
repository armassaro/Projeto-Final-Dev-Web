from typing import Literal

from pydantic import Field, field_validator

from .base import CamelModel

ObservationImpact = Literal["nenhum", "aumenta", "reduz"]
RiskLevel = Literal["baixo", "medio", "alto", "sem_dados"]


class StudentBase(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    classroom_id: str
    family_income: float | None = Field(default=None, ge=0)
    observations: str = Field(default="", max_length=1000)
    observation_impact: ObservationImpact = "nenhum"

    @field_validator("name", "observations")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        if not value:
            raise ValueError("Informe o nome do aluno.")
        return value


class StudentCreate(StudentBase):
    pass


class StudentUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    classroom_id: str | None = None
    family_income: float | None = Field(default=None, ge=0)
    observations: str | None = Field(default=None, max_length=1000)
    observation_impact: ObservationImpact | None = None

    @field_validator("name", "observations")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class StudentRead(StudentBase):
    id: str


class RiskAssessment(CamelModel):
    level: RiskLevel
    score: int = Field(ge=0, le=100)
    average: float | None = None
    reasons: list[str]
    suggestion: str


class StudentWithRisk(StudentRead):
    classroom_name: str
    risk: RiskAssessment
