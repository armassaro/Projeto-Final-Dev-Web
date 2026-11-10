import json
from functools import lru_cache
from pathlib import Path

from typesafe_sdk import Choice, Noul, Score

from schemas.alunos import RiskAssessment, StudentRead
from schemas.lancamentos import StudentRecords
from services.jev_client import get_jev_client

EXAMPLES_FILE = Path(__file__).parent / "jev_exemplos.json"

# Score: cada posição da lista é um nível, começando em 0.
SCORE_LEVELS = [
    "Nenhum sinal de risco",
    "Poucos sinais de risco",
    "Sinais moderados de risco",
    "Muitos sinais de risco",
    "Risco iminente de evasão",
]

# Noul é uma pergunta de sim/não. Cada fator confirmado vira um motivo na resposta.
FACTORS = {
    "notas_baixas": "Notas abaixo da média ou em queda",
    "faltas_frequentes": "Faltas frequentes nas últimas semanas",
    "entregas_atrasadas": "Atividades entregues com atraso ou pendentes",
    "vulnerabilidade_social": "Renda familiar baixa (menos de R$ 2.000)",
    "observacao_preocupante": "Observação do professor indica dificuldade",
}

SUGGESTIONS = {
    "acompanhar": "Manter o acompanhamento regular e reconhecer o bom desempenho.",
    "reforco": "Oferecer reforço escolar e conversar com o aluno sobre as dificuldades.",
    "contato_familia": "Entrar em contato com a família para entender a situação do aluno.",
    "encaminhar": "Encaminhar o caso à coordenação pedagógica ou à assistência social.",
}

FACTOR_QUESTIONS = {
    "notas_baixas": "As notas do aluno estão abaixo de 6 ou caindo ao longo do período?",
    "faltas_frequentes": "O aluno tem faltas frequentes ou recentes?",
    "entregas_atrasadas": "O aluno tem entregas atrasadas ou pendentes (deliveredAt nulo)?",
    "vulnerabilidade_social": (
        "A renda familiar mensal (familyIncome, em reais) é menor que R$ 2.000? "
        "Responda não se familyIncome for nulo."
    ),
    "observacao_preocupante": "A observação do professor indica uma dificuldade que aumenta o risco de evasão?",
}

QUESTIONS = {
    "risco": Choice(
        instructions=(
            "Classifique o risco de evasão escolar do aluno considerando notas, faltas, "
            "entregas, renda familiar e as observações do professor. O campo "
            "observationImpact indica se o professor acha que a observação aumenta ou reduz o risco."
        ),
        criteria={
            "baixo": "Desempenho e frequência adequados, sem sinais relevantes de evasão",
            "medio": "Alguns sinais de alerta que pedem acompanhamento",
            "alto": "Vários sinais de alerta combinados, com risco real de evasão",
        },
    ),
    "pontuacao": Score(
        instructions="Quão forte é o risco de evasão deste aluno?",
        criteria=SCORE_LEVELS,
    ),
    "acao": Choice(
        instructions="Qual ação o professor deve tomar primeiro para este aluno?",
        criteria=SUGGESTIONS,
    ),
    **{name: Noul(instructions=text) for name, text in FACTOR_QUESTIONS.items()},
}

FACTOR_THRESHOLD = 0.5


class ExampleStudent(StudentRead):
    records: StudentRecords


@lru_cache(maxsize=1)
def load_examples() -> dict[str, ExampleStudent]:
    raw = json.loads(EXAMPLES_FILE.read_text(encoding="utf-8"))
    examples = [ExampleStudent.model_validate(item) for item in raw]
    return {example.id: example for example in examples}


def _average(records: StudentRecords) -> float | None:
    if not records.grades:
        return None
    return round(sum(grade.value for grade in records.grades) / len(records.grades), 1)


def _build_state(student: ExampleStudent) -> dict:
    state = student.model_dump(mode="json", by_alias=True, exclude={"id", "classroom_id"})
    state["average"] = _average(student.records)
    return state


def assess_risk(student: ExampleStudent) -> RiskAssessment:
    records = student.records
    if not records.grades and not records.absences and not records.deliveries:
        return RiskAssessment(
            level="sem_dados",
            score=0,
            average=None,
            reasons=["Ainda não há lançamentos para este aluno."],
            suggestion="Registre notas, faltas ou entregas para que o risco seja calculado.",
        )

    result = get_jev_client().system_one(_build_state(student), QUESTIONS)

    risk = result.choices["risco"]
    max_level = len(SCORE_LEVELS) - 1
    score = round(min(max(result.scores["pontuacao"].score, 0), max_level) * 100 / max_level)

    confirmed = sorted(
        (name for name in FACTORS if result.nouls[name].noul >= FACTOR_THRESHOLD),
        key=lambda name: result.nouls[name].noul,
        reverse=True,
    )
    reasons = [FACTORS[name] for name in confirmed] or ["Nenhum fator de risco relevante identificado."]

    return RiskAssessment(
        level=risk.choice,
        score=score,
        average=_average(records),
        reasons=reasons,
        suggestion=SUGGESTIONS[result.choices["acao"].choice],
        confidence=risk.confidence,
    )
