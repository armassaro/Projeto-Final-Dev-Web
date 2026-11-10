from datetime import date, timedelta

import storage
from auth.security import hash_password

DEMO_PASSWORD = "senha123"

TEACHERS = [
    {"id": "prof-1", "name": "Helena Martins", "email": "helena@escola.edu.br"},
    {"id": "prof-2", "name": "Rafael Tavares", "email": "rafael@escola.edu.br"},
]

CLASSROOMS = [
    {"id": "turma-1", "teacher_id": "prof-1", "name": "9º ano A", "subject": "Matemática", "year": 2026},
    {"id": "turma-2", "teacher_id": "prof-1", "name": "1ª série B", "subject": "Matemática", "year": 2026},
    {"id": "turma-3", "teacher_id": "prof-2", "name": "8º ano C", "subject": "História", "year": 2026},
]

STUDENTS = [
    {"classroom_id": "turma-1", "name": "Ana Clara Ferreira", "income": 5200, "activities": [9, 8.5, 9.5], "exams": [8.5, 9], "previous": 8.5, "absences": 1},
    {"classroom_id": "turma-1", "name": "Bruno Henrique Costa", "income": 2400, "activities": [6, 5.5, 6.5], "exams": [5, 5.5], "previous": 6.5, "absences": 5, "late": 1},
    {"classroom_id": "turma-1", "name": "Camila Rocha Santos", "income": 1400, "activities": [4, 3.5, 3], "exams": [3.5, 2.5], "previous": 5, "absences": 11, "late": 1, "missing": 1, "observations": "Começou a trabalhar no período da tarde para ajudar em casa.", "impact": "aumenta"},
    {"classroom_id": "turma-1", "name": "Diego Almeida Nunes", "income": 3100, "activities": [7.5, 7, 8], "exams": [7, 7.5], "previous": 7, "absences": 2},
    {"classroom_id": "turma-1", "name": "Eduarda Pereira Lima", "income": 1800, "activities": [5.5, 4.5, 5], "exams": [5, 4], "previous": 6, "absences": 7, "missing": 1},
    {"classroom_id": "turma-1", "name": "Felipe Gomes Barros", "income": 4300, "activities": [8, 8, 7.5], "exams": [6.5, 7], "previous": 7.5, "absences": 3, "late": 1, "observations": "Participa do grupo de monitoria às quintas-feiras.", "impact": "reduz"},
    {"classroom_id": "turma-2", "name": "Gabriela Moreira Dias", "income": 2900, "activities": [7, 6.5, 7.5], "exams": [6.5, 7], "previous": 7, "absences": 3},
    {"classroom_id": "turma-2", "name": "Heitor Vieira Campos", "income": 1300, "activities": [3, 4, 2.5], "exams": [3, 2], "previous": 4.5, "absences": 12, "missing": 2, "observations": "Mudança recente de bairro; depende de dois ônibus para chegar à escola.", "impact": "aumenta"},
    {"classroom_id": "turma-2", "name": "Isabela Duarte Pinto", "income": 6100, "activities": [9.5, 10, 9], "exams": [9, 9.5], "previous": 9, "absences": 0},
    {"classroom_id": "turma-2", "name": "João Pedro Cardoso", "income": 2100, "activities": [6, 5, 6], "exams": [4.5, 5.5], "previous": 6, "absences": 6, "late": 2},
    {"classroom_id": "turma-3", "name": "Larissa Teixeira Melo", "income": 2600, "activities": [7, 8, 7.5], "exams": [7, 8], "previous": 7.5, "absences": 2},
    {"classroom_id": "turma-3", "name": "Matheus Ribeiro Farias", "income": 1500, "activities": [4.5, 4, 5], "exams": [4, 3.5], "previous": 5.5, "absences": 9, "missing": 1},
]

ACTIVITIES = [
    {"description": "Lista de exercícios 1", "date": date(2026, 8, 14)},
    {"description": "Trabalho em grupo", "date": date(2026, 9, 11)},
    {"description": "Lista de exercícios 2", "date": date(2026, 10, 9)},
]

EXAMS = [
    {"description": "Prova do 3º bimestre", "date": date(2026, 9, 25)},
    {"description": "Prova do 4º bimestre", "date": date(2026, 10, 30)},
]

ABSENCE_DATES = [
    date(2026, 8, 5), date(2026, 8, 12), date(2026, 8, 19), date(2026, 8, 26),
    date(2026, 9, 2), date(2026, 9, 9), date(2026, 9, 16), date(2026, 9, 23),
    date(2026, 9, 30), date(2026, 10, 7), date(2026, 10, 14), date(2026, 10, 21),
]


def _add_grade(grade_id: str, student_id: str, grade_type: str, description: str, value: float, grade_date: date) -> None:
    storage.grades[grade_id] = {
        "id": grade_id,
        "student_id": student_id,
        "type": grade_type,
        "description": description,
        "value": value,
        "date": grade_date,
    }


def load_seed_data() -> None:
    if storage.teachers:
        return

    password_hash = hash_password(DEMO_PASSWORD)
    for teacher in TEACHERS:
        storage.teachers[teacher["id"]] = {**teacher, "password_hash": password_hash}

    for classroom in CLASSROOMS:
        storage.classrooms[classroom["id"]] = dict(classroom)

    for index, seed in enumerate(STUDENTS, start=1):
        student_id = f"aluno-{index}"
        storage.students[student_id] = {
            "id": student_id,
            "classroom_id": seed["classroom_id"],
            "name": seed["name"],
            "family_income": seed["income"],
            "observations": seed.get("observations", ""),
            "observation_impact": seed.get("impact", "nenhum"),
        }

        _add_grade(f"{student_id}-anterior", student_id, "prova", "Prova do 1º bimestre", seed["previous"], date(2026, 3, 27))
        for i, activity in enumerate(ACTIVITIES):
            _add_grade(f"{student_id}-atividade-{i}", student_id, "atividade", activity["description"], seed["activities"][i], activity["date"])
        for i, exam in enumerate(EXAMS):
            _add_grade(f"{student_id}-prova-{i}", student_id, "prova", exam["description"], seed["exams"][i], exam["date"])

        for i, absence_date in enumerate(ABSENCE_DATES[: seed["absences"]]):
            absence_id = f"{student_id}-falta-{i}"
            storage.absences[absence_id] = {"id": absence_id, "student_id": student_id, "date": absence_date}

        late = seed.get("late", 0)
        missing = seed.get("missing", 0)
        for i, activity in enumerate(ACTIVITIES):
            from_end = len(ACTIVITIES) - 1 - i
            delivered_at = activity["date"]
            if from_end < missing:
                delivered_at = None
            elif from_end < missing + late:
                delivered_at = activity["date"] + timedelta(days=4)
            delivery_id = f"{student_id}-entrega-{i}"
            storage.deliveries[delivery_id] = {
                "id": delivery_id,
                "student_id": student_id,
                "description": activity["description"],
                "due_date": activity["date"],
                "delivered_at": delivered_at,
            }
