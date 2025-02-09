from classes import ReadingTime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Union
from sqlalchemy.orm import Session
from database_config import HabitSQL, ActionSQL, ReadingLogsSQL, BookSQL, get_db

reading_router = APIRouter(
    prefix="/reading",
    tags=["reading"],
    responses={status.HTTP_404_NOT_FOUND: {"message": "No encontrado"}},
)


@reading_router.get("/", response_model=list[ReadingTime])
async def get_reading_actions(
    skip: int = 0, limit: Union[int, str] = "All", db: Session = Depends(get_db)
):
    return db.query(User).offset(skip).limit(limit).all()


@reading_router.post("/")
def create_action_with_reading_log(
    session: Session,
    habit_id: uuid.UUID,
    book_id: uuid.UUID,
    start_time: datetime,
    end_time: datetime,
    number_of_characters: int,
    breaths: int,
    number_of_characters_per_minute: float,
    number_of_breaths_per_minute: float,
    using_voice: bool
    
):
    # Paso 1: Busca el HabitSQL y BookSQL existentes
    habit = session.query(HabitSQL).filter_by(id=habit_id).first()
    book = session.query(BookSQL).filter_by(id=book_id).first()

    if not habit or not book:
        raise ValueError("Habit or Book not found.")

    # Paso 2: Crea la nueva acción y relaciónala con el hábito
    new_action = ActionSQL(
        id=uuid.uuid4(),
        habit=habit,
        start_time=start_time,
        end_time=end_time
    )

    # Paso 3: Crea el ReadingLogsSQL y relaciónalo con la acción y el libro
    new_reading_log = ReadingLogsSQL(
        id=uuid.uuid4(),
        action=new_action,
        book=book,
        number_of_characters=number_of_characters,
        breaths=breaths,
        number_of_characters_per_minute=number_of_characters_per_minute,
        number_of_breaths_per_minute=number_of_breaths_per_minute
    )

    # Paso 4: Agrega los nuevos registros a la sesión
    session.add(new_action)
    session.add(new_reading_log)

    # Paso 5: Confirma la transacción
    session.commit()
    return new_action
