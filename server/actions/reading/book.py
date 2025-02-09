from classes import Book
from fastapi import APIRouter, HTTPException, status, Depends
from database_config import BookSQL, get_db
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

book_router = APIRouter(
    prefix="/books",
    tags=["books"],
    # responses={status.HTTP_404_NOT_FOUND: {"message": "No encontrado"}},
)

class BookBody(BaseModel):
    name:str
    image:str
    total_pages: int
    average_of_characters_per_minute : Optional[float] = Field(None, example="22.5")
    current_page : Optional[int] = Field(None, example="22")

class BookUpdate(BaseModel):
    name: Optional[str] = Field(None, example="Read a book")
    image: Optional[str] = Field(None, example="image")
    image: Optional[int] = Field(None, example="22")
    average_of_characters_per_minute : Optional[float] = Field(None, example="22.5")
    current_page : Optional[int] = Field(None, example="22")

@book_router.get("/{book_id}")
async def get_book_by_id(book_id:UUID, db: Session = Depends(get_db)):
    try:
        books_arr = db.query(BookSQL).filter(BookSQL.id == book_id).first()
        return books_arr
    except Exception as e:
        return e

@book_router.get("/")
async def get_book(db: Session = Depends(get_db)):
    try:
        books_arr = db.query(BookSQL).all()
        return books_arr
    except Exception as e:
        return e


@book_router.post("/")
async def book_habit(book_model: BookBody, db: Session = Depends(get_db)):
    try:
        
        new_book = BookSQL(

            name= book_model.name,
            image = book_model.image,
            total_pages= book_model.total_pages,
            average_of_characters_per_minute = book_model.average_of_characters_per_minute,
            current_page = book_model.current_page
            
        )
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        return new_book
    except Exception as e:
        print(e)
        return e

@book_router.patch("/{book_id}")
async def update_book(
    book_id: UUID, book_update: BookUpdate, db: Session = Depends(get_db)
):
    try:
        book = db.query(BookSQL).get(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} not found.",
            )

        update_data = book_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(book, key, value)
        db.commit()
        db.refresh(book)
        return habit
    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )