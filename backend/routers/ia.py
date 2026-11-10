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

from auth.dependencies import CurrentTeacher
from schemas.alunos import RiskAssessment
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
    try:
        return assess_risk(example)
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
