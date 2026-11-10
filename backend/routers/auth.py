from fastapi import APIRouter, HTTPException, status

import storage
from auth.dependencies import CurrentTeacher
from auth.security import hash_password, verify_password
from schemas.professores import TeacherCreate, TeacherLogin, TeacherRead

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=TeacherRead, status_code=status.HTTP_201_CREATED)
def register(teacher_data: TeacherCreate):
    if storage.find_teacher_by_email(teacher_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um professor com este e-mail.",
        )

    new_teacher = {
        "id": storage.new_id(),
        "name": teacher_data.name,
        "email": teacher_data.email,
        "password_hash": hash_password(teacher_data.password),
    }
    storage.teachers[new_teacher["id"]] = new_teacher
    return new_teacher


@router.post("/login", response_model=TeacherRead)
def login(credentials: TeacherLogin):
    teacher = storage.find_teacher_by_email(credentials.email)
    if teacher is None or not verify_password(credentials.password, teacher["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )
    return teacher


@router.get("/me", response_model=TeacherRead)
def get_logged_teacher(teacher: CurrentTeacher):
    return teacher
