from pydantic import BaseModel, validator
from typing import Union
from datetime import datetime
from uuid import UUID
from enum import Enum
from database_config import habit_complexity_values

HabitComplexity = Enum(
    "HabitComplexity", {value: value for value in habit_complexity_values}
)


class Habit(BaseModel):
    id: UUID
    name: str
    habit_type: HabitComplexity
    logo: str


class TimeSpent(BaseModel):
    start_time: datetime
    end_time: datetime
    milliseconds: int = 1000
    seconds: int = milliseconds * 1000
    minutes: int = seconds * 60
    hours: int = minutes * 60
    days: int = hours * 24
    months: int = days * 30
    years: int = months * 12

    @validator("end_time")
    def validate_time(cls, end_time, values):
        if "start_time" in values and end_time <= values["start_time"]:
            raise ValueError("end_time must be after start_time")
        return end_time

    def duration_in_minutes(self) -> float:
        return (self.end_time - self.start_time).total_seconds() / 60


class Action(TimeSpent):
    id: UUID


class Exercise(BaseModel):
    name: str
    number_of_repetitions: int
    number_of_series: Union[int, None] = None


class Sport(Action, Exercise):
    def __init__(self, **kwargs):
        Action.__init__(self, **kwargs)
        Exercise.__init__(self, **kwargs)


class Book(BaseModel):
    id: UUID
    name: str
    total_pages: int
    average_of_characters_per_minute: Union[float, None] = None


class ReadingTime(Action):
    id: UUID
    number_of_characters: int
    breaths: int
    number_of_characters_per_minute: float = None
    number_of_breaths_per_minute: float = None

    class Config:
        from_attributes = True

    @validator("end_time")
    def calculate_rates(cls, end_time, values):
        if (
            "start_time" in values
            and "number_of_characters" in values
            and "breaths" in values
        ):
            duration_minutes = (end_time - values["start_time"]).total_seconds() / 60
            values["number_of_characters_per_minute"] = (
                values["number_of_characters"] / duration_minutes
            )
            values["number_of_breaths_per_minute"] = (
                values["breaths"] / duration_minutes
            )
        return end_time


# class Speaking_cute

# s
# bajar y subir la cosa del cuello
# relajarse
# soltar mas aire.

# buenas practicas de programación.
