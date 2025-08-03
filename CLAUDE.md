# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a habit tracking application built with a FastAPI backend and React/TypeScript frontend. The app focuses on tracking reading habits and complex habit management with a PostgreSQL database for persistence.

**Architecture:**
- **Frontend**: React 18 + TypeScript + Vite + Redux Toolkit + Material-UI
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + Alembic for migrations
- **Deployment**: Docker Compose with separate containers for app, database, and GUI

## Development Commands

### Frontend (GUI directory)
```bash
cd GUI
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript + Vite)
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run preview      # Preview production build
```

### Backend (server directory)
```bash
cd server
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port $SERVER_PORT --reload

# Database migrations
alembic upgrade head     # Apply migrations
alembic revision --autogenerate -m "description"  # Create new migration

# Linting
flake8 .
```

### Docker Development
```bash
# Start all services
docker-compose up --build

# Start specific service
docker-compose up python_server_app
docker-compose up habits_postgres
```

## Code Architecture

### Frontend State Management
- **Redux Toolkit**: Centralized state with slices for habits, books, and forms
- **Store structure**: `GUI/src/redux/store.ts` with separate slices:
  - `habits`: Habit CRUD operations and state
  - `book`: Book management and reading tracking
  - `form`: Form validation and UI state

### Backend Structure
- **FastAPI routers**: Modular API endpoints in `habits.py` and `actions/reading/`
- **Database models**: SQLAlchemy models in `database_config.py`
- **Pydantic models**: Request/response schemas in `classes.py`
- **Database**: PostgreSQL with relationships between habits, actions, books, and reading logs

### Key Data Models
**Habits**: Support three complexity types (Complex, Simple, Without Intervals)
**Books**: Track reading progress with pages and character reading rates
**Reading Logs**: Detailed tracking including breathing patterns and voice usage
**Actions**: Time-tracked activities linked to habits

### Component Structure
- **Routing**: React Router with paths for different habit types and reading dashboard
- **Habits**: Complex and simple habit creation/management
- **Reading**: Book management, reading tracking, and progress visualization
- **Forms**: Reusable form components with validation utilities

## Environment Setup
Requires `.env` file with database credentials and server configuration:
```
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=
DATABASE_NAME=
DATABASE_PORT=
SERVER_PORT=
```

## Database Migrations
Uses Alembic for database versioning. Migration files are in `server/alembic/versions/`.
Recent migrations include book image support, current page tracking, and voice usage logging.

## Development Notes
- Frontend runs on port 5173 (Vite default)
- Backend CORS configured for localhost:5173
- TypeScript strict mode enabled
- ESLint + Prettier configured for code formatting
- Material-UI theming and CSS modules for styling