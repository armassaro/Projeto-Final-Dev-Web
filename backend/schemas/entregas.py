from datetime import date
from pydantic import Field, field_validator

from .base import CamelModel


class DeliveryBase(CamelModel):
    student_id: str
    description: str = Field(min_length=1, max_length=255)
    due_date: date
    delivered_at: date | None = None

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Informe a atividade.")
        return value

    @field_validator("delivered_at")
    @classmethod
    def delivered_at_not_in_future(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("Informe uma data de entrega que não esteja no futuro.")
        return value


class DeliveryCreate(DeliveryBase):
    pass


class DeliveryRead(DeliveryBase):
    id: str
