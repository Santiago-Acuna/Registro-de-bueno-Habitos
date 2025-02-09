from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
    Text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

base = declarative_base()
habit_complexity_values = ["Complex", "Simple", "Without Intervals"]


class HabitSQL(base):
    __tablename__ = "habits"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    name = Column(String(50), nullable=False, unique=True,)
    habit_type = Column(
        Enum(*habit_complexity_values, name="complexity_enum"), nullable=False
    )
    logo = Column(Text, nullable=False)
    actions = relationship(
        "ActionSQL", back_populates="habit", foreign_keys="[ActionSQL.habit_id]"
    )


class ActionSQL(base):
    __tablename__ = "actions"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    habit_id = Column(UUID, ForeignKey("habits.id"))
    habit = relationship("HabitSQL", back_populates="actions", foreign_keys=[habit_id])
    reading_log = relationship("ReadingLogsSQL", uselist=False, back_populates="action")
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)


class BookSQL(base):
    __tablename__ = "books"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    name = Column(String(50), nullable=False)
    image = Column(Text, nullable=True)
    total_pages = Column(Integer, nullable=False)
    average_of_characters_per_minute = Column(Float, nullable=True)
    reading_logs = relationship(
        "ReadingLogsSQL", back_populates="book", foreign_keys="[ReadingLogsSQL.book_id]"
    )
    current_page = Column(Integer, nullable=True, default=0) #poner default value 0


class ReadingLogsSQL(base):
    __tablename__ = "reading_logs"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    action_id = Column(UUID, ForeignKey("actions.id"), unique=True)
    action = relationship("ActionSQL", back_populates="reading_log")
    book_id = Column(UUID, ForeignKey("books.id"))
    book = relationship(
        "BookSQL", back_populates="reading_logs", foreign_keys=[book_id]
    )
    number_of_characters = Column(Integer, nullable=False)
    breaths = Column(Integer, nullable=False)
    number_of_characters_per_minute = Column(Float, nullable=False)
    number_of_breaths_per_minute = Column(Float, nullable=False)
    using_voice = Column(Boolean, nullable= False)


engine = create_engine(
    f'postgresql+psycopg2://{os.getenv("DATABASE_USER")}:{os.getenv("DATABASE_PASSWORD")}@{os.getenv("DATABASE_HOST")}/{os.getenv("DATABASE_NAME")}'
)

# Crear las tablas

base.metadata.create_all(engine)

# Crear una sesión
session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()
