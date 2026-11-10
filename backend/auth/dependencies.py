from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

import storage


def get_current_teacher(x_teacher_id: Annotated[str | None, Header()] = None) -> dict:
    if x_teacher_id is None or x_teacher_id not in storage.teachers:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Faça login para continuar.",
        )
    return storage.teachers[x_teacher_id]


CurrentTeacher = Annotated[dict, Depends(get_current_teacher)]
