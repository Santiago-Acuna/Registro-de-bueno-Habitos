# CLAUDE.md - Backend Server

This file provides guidance to Claude Code when working with the backend server code in this directory.

## Architecture Overview

This is a **Domain-Driven Design (DDD)** backend implementation using **Clean Architecture** principles with **NestJS** framework.

### Core Architecture Layers

```
src/
├── domain/                 # Domain Layer (Core Business Logic)
│   ├── entities/          # Rich domain entities with business rules
│   ├── value-objects/     # Immutable value objects with validation
│   └── shared/           # Common domain types and interfaces
├── habits/               # Application Layer (Use Cases)
│   ├── controllers/      # HTTP controllers (Presentation Layer)
│   ├── services/         # Application services orchestrating domain
│   ├── dto/             # Data transfer objects for API boundaries
│   └── interfaces/      # Repository contracts (Domain Layer)
└── infrastructure/      # Infrastructure Layer (External Concerns)
    ├── database/        # Prisma ORM configuration and service
    ├── exceptions/      # Custom exception handling
    ├── filters/         # Global exception filters
    └── interceptors/    # Logging and cross-cutting concerns
```

## Key DDD Patterns Implemented

1. **Rich Domain Model**: Entities contain business logic, not just data
   - `Habit` entity with methods like `deactivate()`
   - Domain-driven validation and business rules enforcement

2. **Value Objects**: Encapsulate validation and business rules
   - `HabitName` with length validation and immutability
   - Type-safe domain concepts

3. **Repository Pattern**: Abstract data access behind interfaces
   - `IHabitsRepository` interface in domain layer
   - `HabitsRepository` implementation in infrastructure

4. **Dependency Inversion**: High-level modules don't depend on low-level modules
   - Services depend on repository interfaces, not concrete implementations
   - Dependency injection through NestJS IoC container

5. **Application Services**: Orchestrate domain operations
   - `HabitsService` handles use cases and domain coordination
   - Maps between DTOs and domain entities

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas for input validation
- **File Upload**: Cloudinary integration for image handling
- **Documentation**: Swagger/OpenAPI auto-generation
- **Testing**: Jest with TDD practices

## Development Guidelines

### Domain Layer Rules
- Keep domain entities pure - no framework dependencies
- Implement business rules and validation within domain objects
- Use value objects for complex types with validation
- Domain objects should be immutable where possible

### Application Layer
- Services orchestrate domain operations
- Handle use case logic and error handling
- Map between DTOs and domain entities
- Coordinate with external services (Cloudinary, etc.)

### Infrastructure Layer
- Implement repository interfaces
- Handle external service integrations
- Manage database connections and transactions
- Provide cross-cutting concerns (logging, exception handling)

## Database Schema

Uses Prisma ORM with PostgreSQL. Key entities:
- `habits` - Main habit tracking table with soft delete support
- Supports pagination, filtering, and complex queries
- Migration-based schema management

## Development Commands

```bash
# Start development server
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Database operations
npx prisma migrate dev
npx prisma generate
npx prisma studio

# Build for production
npm run build

# Code quality
npm run lint
npm run format
```

## API Documentation

- Swagger UI available at `/api` endpoint when server is running
- Auto-generated from NestJS decorators and DTOs
- Includes request/response schemas and validation rules

## Error Handling

Custom exception hierarchy:
- `NotFoundError` - 404 responses
- `ConflictError` - 409 for business rule violations
- `ValidationException` - 400 for validation failures
- Global exception filter provides consistent error responses

## Development Workflow

**Phase 1: Architecture & Planning**

1. nodejs-programming-mentor: Architectural guidance - USE for complex decisions
2. user-story-creator: User Stories - USE for create new tasks
3. git-workflow-manager: Commit - USE after each phase

**Phase 2: Test-Driven Development**
4. nodejs-tdd-test-first: Create tests - USE for each task
5. git-workflow-manager: Commit RED phase
6. nodejs-test-implementer: Implement - USE after tests fail
7. git-workflow-manager: Commit GREEN phase

**Phase 3: Quality & Security**
8. security-auditor: Audit - USE before main merge
9. git-workflow-manager: Commit fixes

**Git Strategy (NO Claude mentions)**
- Architecture: "feat: add [feature] architecture"
- Tests: "test: add [feature] tests (RED)"
- Implementation: "feat: implement [feature] (GREEN)"
- Security: "fix: security improvements"

**RULES**
- NEVER write code without concrete functionality
- NEVER implement without failing tests
- NEVER mention Claude in commits
- ALWAYS apply ESLint + Prettier
- ALWAYS Git commits about files from the server folder go to the back-end branch.