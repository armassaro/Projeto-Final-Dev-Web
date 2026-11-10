from uuid import uuid4

teachers: dict[str, dict] = {}
classrooms: dict[str, dict] = {}
students: dict[str, dict] = {}
grades: dict[str, dict] = {}
absences: dict[str, dict] = {}
deliveries: dict[str, dict] = {}


def new_id() -> str:
    return uuid4().hex


def find_teacher_by_email(email: str) -> dict | None:
    return next((teacher for teacher in teachers.values() if teacher["email"] == email), None)


def classrooms_of_teacher(teacher_id: str) -> list[dict]:
    return [classroom for classroom in classrooms.values() if classroom["teacher_id"] == teacher_id]


def students_of_classroom(classroom_id: str) -> list[dict]:
    return [student for student in students.values() if student["classroom_id"] == classroom_id]


def records_of_student(student_id: str) -> dict[str, list[dict]]:
    return {
        "grades": [grade for grade in grades.values() if grade["student_id"] == student_id],
        "absences": [absence for absence in absences.values() if absence["student_id"] == student_id],
        "deliveries": [delivery for delivery in deliveries.values() if delivery["student_id"] == student_id],
    }
