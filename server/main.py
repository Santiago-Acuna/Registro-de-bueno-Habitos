from fastapi import FastAPI
from habits import habit_router
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from actions.reading.book import book_router

load_dotenv()

app = FastAPI()

app.include_router(book_router)
app.include_router(habit_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia al puerto de Vite
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    # Cambia el puerto aquí
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("SERVER_PORT")))
