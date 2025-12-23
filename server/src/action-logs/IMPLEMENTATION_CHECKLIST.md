# Action Logs Module - Implementation Checklist (GREEN Phase)

## Overview
This checklist guides the implementation of the action-logs module to make all RED phase tests pass.

## Required Files to Create

### 1. Domain Layer
- [ ] `src/domain/entities/action-log.entity.ts`
  - ActionLog entity with business logic
  - Properties: id, startTime, endTime, durationSeconds, actionDate, actionTypeId, createdAt, updatedAt
  - Methods: validation, business rules

### 2. DTOs (Data Transfer Objects)
- [ ] `src/action-logs/dto/create-action-log.dto.ts`
  - Zod schema for validation
  - Fields: startTime (required), endTime (optional), durationSeconds (optional), actionDate (optional), actionTypeId (required)
  - Validation decorators from class-validator

- [ ] `src/action-logs/dto/action-log-response.dto.ts`
  - Response DTO for API
  - All fields from ActionLog entity
  - Swagger API decorators

- [ ] `src/action-logs/dto/action-logs-query.dto.ts`
  - Extends PaginationQueryDto
  - Optional filters: actionTypeId, startDate, endDate
  - Validation decorators

### 3. Repository Interface
- [ ] `src/action-logs/interfaces/action-logs-repository.interface.ts`
  - IActionLogsRepository interface
  - Methods:
    - `create(data: CreateActionLogDto): Promise<ActionLog>`
    - `findById(id: UUID): Promise<ActionLog | null>`
    - `findAll(pagination: PaginationQueryDto, filters?: FilterOptions): Promise<PaginatedResult<ActionLog>>`
    - `findByActionTypeId(actionTypeId: UUID): Promise<ActionLog[]>`

### 4. Service Layer
- [ ] `src/action-logs/services/action-logs.service.ts`
  - Inject IActionLogsRepository
  - Implement create() method with validation
    - Validate endTime >= startTime
    - Validate durationSeconds >= 0
    - Calculate duration if not provided
    - Check action type exists
  - Implement findAll() method with pagination and filters
  - Implement findOne() method with NotFoundError
  - Map entities to response DTOs
  - Add logging

### 5. Controller Layer
- [ ] `src/action-logs/controllers/action-logs.controller.ts`
  - @ApiTags('action-logs')
  - @Controller('action-logs')
  - @UseGuards(ThrottlerGuard)
  - POST /action-logs endpoint
  - GET /action-logs endpoint with query params
  - GET /action-logs/:id endpoint
  - Swagger decorators
  - UUID validation pipe

### 6. Repository Implementation
- [ ] `src/action-logs/repositories/action-logs.repository.ts`
  - Implement IActionLogsRepository
  - Use Prisma for database operations
  - Map Prisma models to domain entities
  - Handle pagination
  - Apply filters (actionTypeId, date range)

### 7. Module Configuration
- [ ] `src/action-logs/action-logs.module.ts`
  - Import PrismaModule or DatabaseModule
  - Register ActionLogsController
  - Provide ActionLogsService
  - Bind IActionLogsRepository to ActionLogsRepository implementation
  - Export service if needed by other modules

### 8. Main App Integration
- [ ] Update `src/app.module.ts`
  - Import ActionLogsModule

## Implementation Order (Recommended)

1. **Domain Entity** - Start with pure domain logic
   - Create ActionLog entity
   - Add validation methods
   - No external dependencies

2. **Repository Interface** - Define the contract
   - IActionLogsRepository interface
   - Domain layer contract

3. **DTOs** - Data validation layer
   - CreateActionLogDto with Zod/class-validator
   - ActionLogResponseDto
   - ActionLogsQueryDto

4. **Repository Implementation** - Infrastructure layer
   - ActionLogsRepository with Prisma
   - Database operations
   - Entity mapping

5. **Service** - Application layer
   - ActionLogsService
   - Business logic orchestration
   - Use repository through interface
   - Validation rules

6. **Controller** - Presentation layer
   - ActionLogsController
   - HTTP endpoints
   - Request/response handling
   - Swagger documentation

7. **Module** - Dependency injection
   - ActionLogsModule
   - Wire everything together

8. **App Integration** - Global registration
   - Import module in AppModule

## Validation Rules to Implement

### CreateActionLogDto
```typescript
{
  startTime: Date (required, must be valid date)
  endTime: Date (optional, must be >= startTime if provided)
  durationSeconds: number (optional, must be >= 0, must be integer)
  actionDate: Date (optional, defaults to CURRENT_DATE)
  actionTypeId: UUID (required, must be valid UUID)
}
```

### ActionLogsQueryDto
```typescript
{
  page: number (min: 1, default: 1)
  limit: number (min: 1, max: 100, default: 10)
  actionTypeId: UUID (optional, must be valid UUID)
  startDate: Date (optional)
  endDate: Date (optional, must be >= startDate if provided)
}
```

## Business Rules to Implement

1. **Time Validation**
   - endTime must be after or equal to startTime
   - Cannot create action log with endTime before startTime

2. **Duration Calculation**
   - If endTime and startTime provided but no durationSeconds, calculate automatically
   - durationSeconds = (endTime - startTime) in seconds

3. **Action Type Validation**
   - actionTypeId must reference existing actionTypes record
   - Throw NotFoundError if action type doesn't exist

4. **Date Range Filtering**
   - When both startDate and endDate provided, validate endDate >= startDate
   - Filter by actionDate field

## Error Handling

- **ValidationException** (400)
  - Invalid input data
  - Business rule violations
  - Schema validation failures

- **NotFoundError** (404)
  - Action log not found by ID
  - Action type not found

- **Database Errors** (500)
  - Database connection issues
  - Unexpected errors

## Testing Strategy

After each implementation step:
1. Run relevant unit tests
2. Fix failing tests
3. Ensure tests pass
4. Move to next step

Final verification:
```bash
npm test -- action-logs
```

All 142+ tests should pass (GREEN phase).

## Code Quality Checklist

- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] TypeScript strict mode enabled
- [ ] No any types used
- [ ] All public methods documented
- [ ] Swagger decorators on all endpoints
- [ ] Logger used for important operations
- [ ] Error handling comprehensive
- [ ] Repository pattern followed
- [ ] Dependency injection used
- [ ] Clean Architecture layers respected

## Swagger Documentation Required

### POST /api/v1/action-logs
- @ApiOperation({ summary: 'Create a new action log' })
- @ApiBody({ type: CreateActionLogDto })
- @ApiResponse({ status: 201, type: ActionLogResponseDto })
- @ApiResponse({ status: 400, description: 'Validation error' })
- @ApiResponse({ status: 404, description: 'Action type not found' })

### GET /api/v1/action-logs
- @ApiOperation({ summary: 'Get all action logs with pagination' })
- @ApiQuery for filters
- @ApiResponse({ status: 200, type: PaginatedResponseDto })
- @ApiResponse({ status: 400, description: 'Invalid query parameters' })

### GET /api/v1/action-logs/:id
- @ApiOperation({ summary: 'Get action log by ID' })
- @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
- @ApiResponse({ status: 200, type: ActionLogResponseDto })
- @ApiResponse({ status: 404, description: 'Action log not found' })

## Performance Considerations

- [ ] Database indexes on actionTypeId (already exists in schema)
- [ ] Database indexes on actionDate (already exists in schema)
- [ ] Database indexes on startTime (already exists in schema)
- [ ] Efficient pagination with Prisma
- [ ] Limit query result set size (max 100)

## Security Considerations

- [ ] UUID validation on parameters
- [ ] Input sanitization via DTOs
- [ ] Rate limiting via ThrottlerGuard
- [ ] No SQL injection (using Prisma ORM)
- [ ] Proper error messages (no sensitive data)

## Example Implementation Snippets

### ActionLog Entity
```typescript
export class ActionLog {
  constructor(
    public readonly id: UUID,
    public readonly startTime: Date,
    public readonly endTime: Date | null,
    public readonly durationSeconds: number | null,
    public readonly actionDate: Date,
    public readonly actionTypeId: UUID,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  validate(): void {
    if (this.endTime && this.endTime < this.startTime) {
      throw new ValidationException('End time must be after start time');
    }
    if (this.durationSeconds !== null && this.durationSeconds < 0) {
      throw new ValidationException('Duration must be positive');
    }
  }
}
```

### Service Method Example
```typescript
async create(dto: CreateActionLogDto): Promise<ActionLogResponseDto> {
  this.logger.log(`Creating action log for action type: ${dto.actionTypeId}`);

  // Validation
  if (dto.endTime && dto.endTime < dto.startTime) {
    throw new ValidationException('End time must be after start time');
  }

  // Create entity
  const actionLog = await this.actionLogsRepository.create(dto);

  this.logger.log(`Created action log with id: ${actionLog.id}`);

  return this.mapToResponse(actionLog);
}
```

## Final Verification

Before considering GREEN phase complete:
1. All 142+ tests passing
2. ESLint clean
3. Prettier applied
4. TypeScript compilation successful
5. Swagger UI showing all endpoints
6. Manual API testing with Postman/Thunder Client
7. Database migrations run successfully

## Next Phase: REFACTOR

After GREEN phase (all tests passing):
1. Review code for duplication
2. Extract common patterns
3. Improve naming
4. Add JSDoc comments
5. Optimize performance
6. Run security audit
7. Final commit with message: "feat: implement action-logs module (GREEN)"
