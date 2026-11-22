import logging

from fastapi import APIRouter, HTTPException, status
from typesafe_sdk import (
    TypeSafeAPIConnectionError,
    TypeSafeAPIError,
    TypeSafeAuthenticationError,
    TypeSafeError,
    TypeSafeInternalServerError,
    TypeSafePermissionDeniedError,
    TypeSafeRateLimitError,
)

import storage
from auth.dependencies import CurrentTeacher
from routers.common import get_owned_student
from schemas.alunos import RiskAssessment, StudentRead
from schemas.lancamentos import StudentRecords
from services.jev_risco import ExampleStudent, assess_risk, load_examples

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ia", tags=["IA"])


def _get_example(example_id: str) -> ExampleStudent:
    example = load_examples().get(example_id)
    if example is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno de exemplo não encontrado.")
    return example


@router.get("/exemplos", response_model=list[ExampleStudent])
def list_examples(teacher: CurrentTeacher):
    return list(load_examples().values())


@router.post("/exemplos/{example_id}/risco", response_model=RiskAssessment)
def assess_example_risk(example_id: str, teacher: CurrentTeacher):
    example = _get_example(example_id)
    return _run_assessment(example, example.records)


@router.post("/alunos/{student_id}/risco", response_model=RiskAssessment)
def assess_student_risk(student_id: str, teacher: CurrentTeacher):
    """Calcula com a IA o risco de evasão de um aluno do professor logado."""
    student = StudentRead.model_validate(get_owned_student(student_id, teacher))
    records = StudentRecords.model_validate(storage.records_of_student(student_id))
    return _run_assessment(student, records)


def _run_assessment(student: StudentRead, records: StudentRecords) -> RiskAssessment:
    try:
        return assess_risk(student, records)
    except (TypeSafeAuthenticationError, TypeSafePermissionDeniedError) as error:
        logger.warning("Jev recusou a chave da API (status %s)", error.status)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="A análise por IA não está configurada no servidor.",
        )
    except (TypeSafeAPIConnectionError, TypeSafeRateLimitError, TypeSafeInternalServerError) as error:
        logger.warning("Jev indisponível: %s", error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O serviço de IA está indisponível. Tente novamente em instantes.",
        )
    except TypeSafeAPIError as error:
        logger.warning("Jev recusou a requisição (status %s)", error.status)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O serviço de IA devolveu uma resposta inválida.",
        )
    except TypeSafeError as error:
        # Erros antes do envio, como a chave da API ausente no .env.
        logger.warning("Jev não configurado: %s", error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="A análise por IA não está configurada no servidor.",
        )
