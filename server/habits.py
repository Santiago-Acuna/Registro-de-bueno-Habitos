from classes import Habit
from fastapi import APIRouter, HTTPException, status, Depends
from database_config import HabitSQL, get_db
from sqlalchemy import select
from sqlalchemy.orm import Session
from enum import Enum
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

habit_router = APIRouter(
    prefix="/habits",
    tags=["habit"],
    # responses={status.HTTP_404_NOT_FOUND: {"message": "No encontrado"}},
)


class HabitComplexity(Enum):
    Complex: str = "Complex"
    Simple: str = "Simple"
    Without_Intervals: str = "Without Intervals"


class HabitBody(BaseModel):
    name: str
    habit_type: HabitComplexity
    logo: str


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, example="Read a book")
    habit_type: Optional[HabitComplexity] = Field(None, example=HabitComplexity.Simple)
    logo: Optional[str] = Field(None, example="https://example.com/logo.png")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Meditate",
                "habit_type": "Simple",
                "logo": "https://example.com/meditate.png",
            }
        }


@habit_router.get("/{habit_id}")
async def get_habit_by_id(habit_id: UUID, db: Session = Depends(get_db)):
    try:
        habit = (
        db.query(HabitSQL)
        .options(
            joinedload(HabitSQL.actions)
            .joinedload(ActionSQL.reading_log)
            .joinedload(ReadingLogsSQL.book)
        )
        .filter(HabitSQL.id == habit_id)
        .first()
        )
        return habit
    except Exception as e:
        return e


# response_model=list[Habit]
@habit_router.get("/")
async def get_habit(complexity: str = "all", db: Session = Depends(get_db)):
    try:
        habits_arr = db.query(HabitSQL).all()
        return habits_arr
    except Exception as e:
        return e




@habit_router.post("/")
async def create_habit(habit_model: HabitBody, db: Session = Depends(get_db)):
    try:
        new_habit = HabitSQL(
            name=habit_model.name,
            habit_type=habit_model.habit_type.value,
            logo=habit_model.logo,
        )
        db.add(new_habit)
        db.commit()
        db.refresh(new_habit)
        return new_habit
    except Exception as e:
        return e


@habit_router.patch("/{habit_id}", response_model=HabitBody)
async def update_habit(
    habit_id: UUID, habit_update: HabitUpdate, db: Session = Depends(get_db)
):
    try:
        habit = db.query(HabitSQL).get(habit_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with id {habit_id} not found.",
            )

        update_data = habit_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key == "habit_type":
                setattr(habit, key, value.value)
            else:
                setattr(habit, key, value)

        db.commit()
        db.refresh(habit)
        return habit
    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
