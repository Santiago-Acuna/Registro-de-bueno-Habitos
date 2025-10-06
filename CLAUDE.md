# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack habit tracking application with a clean architecture pattern:

**Structure:**
- `front/` - React + TypeScript frontend with Vite, Redux Toolkit for state management, Material-UI components
- `server/` - Node.js + TypeScript backend with NestJS framework, Clean Architecture pattern, Prisma ORM
- Root level contains Docker configurations for the full application stack

### Docker Development:
```bash
# Full stack (run from root)
docker-compose up --build

# Backend only (run from server/)
docker-compose -f docker-compose.dev.yml up --build
```

## Key Technologies

**Frontend:**
- React 19 with TypeScript
- Redux Toolkit for state management
- Material-UI (@mui/material) for components
- Vite for build tooling
- Axios for HTTP requests
- React Router for navigation

**Backend:**
- Node.js with NestJS framework
- TypeScript with strict configuration
- Prisma ORM with PostgreSQL
- Jest for testing
- Zod for validation
- Cloudinary for image handling
- Swagger/OpenAPI documentation

## Development Workflow

- Back-end development workflow defined at ./server/CLAUDE.md
- Front-end development workflow defined at ./front/CLAUDE.md

## Environment Setup

- Node.js 18+ required for server
- PostgreSQL database (configured via Docker or local)
- Environment files: `.env` in both root and server directories
- Database connection via `DATABASE_URL` environment variable

