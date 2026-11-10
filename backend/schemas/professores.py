from pydantic import Field, field_validator

from .base import CamelModel


class TeacherBase(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Informe o nome do professor.")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Informe um e-mail válido.")
        return value


class TeacherCreate(TeacherBase):
    password: str = Field(min_length=6, max_length=72)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode()) > 72:
            raise ValueError("A senha é longa demais.")
        return value


class TeacherRead(TeacherBase):
    id: str


class TeacherLogin(CamelModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

