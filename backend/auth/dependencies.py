from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import storage
from auth.security import read_teacher_id

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_teacher(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    teacher_id = read_teacher_id(credentials.credentials) if credentials else None
    if teacher_id is None or teacher_id not in storage.teachers:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return storage.teachers[teacher_id]


CurrentTeacher = Annotated[dict, Depends(get_current_teacher)]
