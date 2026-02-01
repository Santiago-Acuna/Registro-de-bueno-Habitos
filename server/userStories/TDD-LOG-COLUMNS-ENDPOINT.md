# TDD Documentation: GET Log Columns by Action Type ID Endpoint

## Overview

This document outlines the Test-Driven Development (TDD) approach for implementing a new GET endpoint that retrieves log columns and their validation functions based on an action type ID.

**Status**: RED Phase Complete ✓
**Created**: 2025-12-23
**Feature**: Get log columns with validations by action type ID

---

## Feature Requirements

### User Story

**As a** frontend developer
**I want to** fetch log column definitions and their validation rules for a specific action type
**So that** I can dynamically render forms with proper validation based on the action type

### Acceptance Criteria

1. ✓ Endpoint accepts action type ID as URL parameter
2. ✓ Returns array of log columns with their validations
3. ✓ Each column includes: id, name, type, logTypeId, and validations array
4. ✓ Each validation includes: id, validationFunctionId, functionName, functionCode, and isForFront flag
5. ✓ Returns 404 when action type doesn't exist
6. ✓ Returns 404 when log type doesn't exist for the action type
7. ✓ Returns empty array when log type has no columns
8. ✓ Handles all three column types: text, number, boolean
9. ✓ Preserves validation order
10. ✓ Includes both frontend and backend validations

---

## Database Flow

### Relationship Chain

```
actionTypes (input: actionTypeId)
    ↓ (has logTypeId)
logTypes
    ↓ (has many)
logColumns
    ↓ (has many)
logColumnValidations
    ↓ (references)
validationFunctions
```

### Query Logic

1. Find `actionType` by `actionTypeId`
2. Extract `logTypeId` from `actionType`
3. Find all `logColumns` where `logTypeId` matches
4. For each `logColumn`, include related `logColumnValidations`
5. For each `logColumnValidation`, include the associated `validationFunction`

### Prisma Schema Reference

```prisma
model actionTypes {
  id         String   @id @db.Uuid
  logTypeId  String   @map("log_type_id") @db.Uuid
  logTypes   logTypes @relation(fields: [logTypeId], references: [id])
  // ... other fields
}

model logTypes {
  id          String       @id @db.Uuid
  name        String       @unique
  logColumns  logColumns[]
  // ... other fields
}

model logColumns {
  id                     String                   @id @db.Uuid
  name                   String
  type                   columnLogType // enum: text, number, boolean
  logTypeId              String                   @map("log_type_id") @db.Uuid
  logColumnValidations   logColumnValidations[]
  logTypes               logTypes                 @relation(fields: [logTypeId], references: [id])
}

model logColumnValidations {
  id                     String               @id @db.Uuid
  logColumnId            String               @map("log_column_id") @db.Uuid
  validationFunctionId   String               @map("validation_function_id") @db.Uuid
  logColumns             logColumns           @relation(fields: [logColumnId], references: [id])
  validationFunctions    validationFunctions  @relation(fields: [validationFunctionId], references: [id])
}

model validationFunctions {
  id                     String                   @id @db.Uuid
  name                   String                   @unique
  function               String
  isForFront             Boolean                  @map("is_for_front")
  logColumnValidations   logColumnValidations[]
}
```

---

## RED Phase: Test Files Created

### 1. DTO Tests

**File**: `src/action-logs/dto/__tests__/log-columns-response.dto.spec.ts`

**Coverage**:
- ✓ LogColumnValidationResponseDto validation
  - All required fields present
  - UUID format validation for id and validationFunctionId
  - String validation for functionName and functionCode
  - Boolean validation for isForFront
- ✓ LogColumnResponseDto validation
  - All required fields present
  - UUID format validation for id and logTypeId
  - String validation for name
  - Enum validation for type (text, number, boolean)
  - Array validation for validations
  - Nested validation of validation objects
- ✓ Swagger documentation metadata
- ✓ Transformation and serialization

**Test Count**: 24 tests

### 2. Controller Tests

**File**: `src/action-logs/controllers/__tests__/action-logs-log-columns.controller.spec.ts`

**Coverage**:
- ✓ HTTP layer and routing
  - Method exists and is callable
  - Returns correct data structure
  - Handles single and multiple columns
  - Returns empty array when appropriate
- ✓ Error handling
  - 404 when action type not found
  - 404 when log type not found
  - Generic error propagation
  - ValidationException handling
- ✓ Response structure validation
  - All column types (text, number, boolean)
  - Multiple validations per column
  - Empty validation arrays
  - Validation function code inclusion
  - isForFront flag handling
- ✓ Parameter validation
  - UUID format validation
  - Correct service invocation
- ✓ Complex scenarios
  - Mixed types and validations
  - Real-world log types (development, reading)
  - Concurrent requests
- ✓ Middleware integration
  - ThrottlerGuard application
  - Swagger documentation
- ✓ Edge cases
  - Long validation code
  - Special characters
  - Validation order preservation

**Test Count**: 31 tests

### 3. Service Tests

**File**: `src/action-logs/services/__tests__/action-logs-log-columns.service.spec.ts`

**Coverage**:
- ✓ Business logic - happy path
  - Single and multiple column retrieval
  - Complete validation details
  - Multiple validations per column
  - Empty validation arrays
- ✓ Business logic - edge cases
  - Empty column arrays
  - All column types
  - isForFront flag preservation
- ✓ Error handling
  - NotFoundError for missing action type
  - NotFoundError for missing log type
  - Generic database errors
  - Unexpected errors
- ✓ Data transformation and mapping
  - Repository data to DTO mapping
  - Validation property preservation
  - Complex function code handling
  - Shared validations across columns
- ✓ Logging behavior
  - Fetch logging
  - Success logging with count
  - Empty result logging
  - Error logging
- ✓ Repository interaction
  - Single call verification
  - Correct parameter passing
  - Data immutability
- ✓ Complex real-world scenarios
  - Development log columns
  - Reading log columns
  - Mixed frontend/backend validations
- ✓ Performance and concurrency
  - Multiple concurrent requests
  - Different action types concurrently

**Test Count**: 25 tests

### 4. Integration E2E Tests

**File**: `src/action-logs/__tests__/action-logs-log-columns.integration.spec.ts`

**Coverage**:
- ✓ Successful responses
  - Single and multiple columns
  - Empty arrays
  - Complete validation details
  - Multiple validations
  - No validations
- ✓ Error responses
  - 404 for missing action type
  - 404 for missing log type
  - 400 for invalid UUID
  - 500 for database errors
- ✓ API versioning
  - Version requirement
  - v1 support
- ✓ HTTP headers and content negotiation
  - JSON content type
  - Accept header handling
  - Standard headers
- ✓ Rate limiting and throttling
  - ThrottlerGuard application
- ✓ Real-world scenarios
  - Development log type
  - Reading log type
  - Mixed frontend/backend validations
- ✓ Edge cases and boundary conditions
  - Long validation code
  - Special characters
  - Different UUIDs
  - Validation order
- ✓ Concurrent requests
  - Simultaneous requests
  - Different action types
- ✓ Validation pipe behavior
  - Query parameter rejection
  - Strict UUID validation
- ✓ Response serialization
  - Date serialization
  - Null handling

**Test Count**: 28 tests

---

## Total Test Coverage

**Total Tests Written**: 108 tests

### Test Distribution

| Layer | File | Tests |
|-------|------|-------|
| DTO | log-columns-response.dto.spec.ts | 24 |
| Controller | action-logs-log-columns.controller.spec.ts | 31 |
| Service | action-logs-log-columns.service.spec.ts | 25 |
| Integration | action-logs-log-columns.integration.spec.ts | 28 |

---

## Implementation Checklist (GREEN Phase)

### 1. DTOs

- [ ] Create `LogColumnValidationResponseDto` class
  - [ ] Add `id: UUID` with @ApiProperty and validation
  - [ ] Add `validationFunctionId: UUID` with @ApiProperty and validation
  - [ ] Add `functionName: string` with @ApiProperty and validation
  - [ ] Add `functionCode: string` with @ApiProperty and validation
  - [ ] Add `isForFront: boolean` with @ApiProperty and validation

- [ ] Create `LogColumnResponseDto` class
  - [ ] Add `id: UUID` with @ApiProperty and validation
  - [ ] Add `name: string` with @ApiProperty and validation
  - [ ] Add `type: 'text' | 'number' | 'boolean'` with @ApiProperty and validation
  - [ ] Add `logTypeId: UUID` with @ApiProperty and validation
  - [ ] Add `validations: LogColumnValidationResponseDto[]` with @ApiProperty and validation

### 2. Repository Interface

- [ ] Add `getLogColumnsByActionTypeId(actionTypeId: UUID): Promise<LogColumnResponseDto[]>` to `IActionLogsRepository`

### 3. Repository Implementation

- [ ] Implement `getLogColumnsByActionTypeId` in Prisma repository
  - [ ] Query action type by ID
  - [ ] Extract log type ID
  - [ ] Query log columns with nested validations
  - [ ] Map to response DTOs
  - [ ] Handle not found cases

### 4. Service Layer

- [ ] Add `getLogColumnsByActionTypeId` method to `ActionLogsService`
  - [ ] Call repository method
  - [ ] Add logging (fetch start, success with count, errors)
  - [ ] Handle NotFoundError for action type
  - [ ] Handle NotFoundError for log type
  - [ ] Return mapped DTOs

### 5. Controller Layer

- [ ] Add `getLogColumnsByActionTypeId` method to `ActionLogsController`
  - [ ] Add @Get('log-columns/:actionTypeId') decorator
  - [ ] Add @Version('1') decorator
  - [ ] Add @ApiOperation decorator
  - [ ] Add @ApiParam decorator for actionTypeId
  - [ ] Add @ApiResponse decorators (200, 404, 400)
  - [ ] Add ParseUUIDPipe for actionTypeId parameter
  - [ ] Call service method and return result

### 6. Module Configuration

- [ ] Verify `ActionLogsModule` exports all necessary components
- [ ] Ensure repository is properly provided

---

## API Documentation

### Endpoint Specification

**Method**: GET
**Path**: `/api/v1/action-logs/log-columns/:actionTypeId`
**Version**: v1
**Guard**: ThrottlerGuard

### Parameters

| Name | Type | In | Required | Description |
|------|------|-----|----------|-------------|
| actionTypeId | UUID | path | Yes | The action type ID |

### Response Codes

| Code | Description | Example Scenario |
|------|-------------|------------------|
| 200 | Success | Log columns retrieved successfully |
| 400 | Bad Request | Invalid UUID format |
| 404 | Not Found | Action type or log type doesn't exist |
| 500 | Internal Server Error | Database connection error |

### Response Schema

```typescript
type LogColumnResponse = {
  id: UUID;
  name: string;
  type: 'text' | 'number' | 'boolean';
  logTypeId: UUID;
  validations: LogColumnValidationResponse[];
}

type LogColumnValidationResponse = {
  id: UUID;
  validationFunctionId: UUID;
  functionName: string;
  functionCode: string;
  isForFront: boolean;
}

// API returns: LogColumnResponse[]
```

### Example Request

```bash
GET /api/v1/action-logs/log-columns/123e4567-e89b-12d3-a456-426614174000
Accept: application/json
```

### Example Response (200 OK)

```json
[
  {
    "id": "b1ffce00-ad1c-5fg9-cc7e-7cc0ce491b22",
    "name": "commitName",
    "type": "text",
    "logTypeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "validations": [
      {
        "id": "c2ggdf11-be2d-6gh0-dd8f-8dd1df502c33",
        "validationFunctionId": "d3hheg22-cf3e-7hi1-ee9g-9ee2eg603d44",
        "functionName": "isNotEmpty",
        "functionCode": "return value !== null && value !== undefined && value !== \"\";",
        "isForFront": true
      },
      {
        "id": "e4iifh33-dg4f-8ij2-ff0h-0ff3fh714e55",
        "validationFunctionId": "f5jjgi44-eh5g-9jk3-gg1i-1gg4gi825f66",
        "functionName": "maxLength",
        "functionCode": "return value.length <= 255;",
        "isForFront": true
      }
    ]
  },
  {
    "id": "g6kkhj55-fi6h-0kl4-hh2j-2hh5hj936g77",
    "name": "isForMe",
    "type": "boolean",
    "logTypeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "validations": []
  }
]
```

### Example Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "ActionType with id 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

---

## Test Execution Results

### RED Phase Verification

```bash
npm test -- --testPathPattern="log-columns" --no-coverage
```

**Expected Result**: All tests fail (RED phase) ✓

**Actual Result**: Tests fail with expected errors:
- Property 'getLogColumnsByActionTypeId' does not exist on type 'Mocked<IActionLogsRepository>'
- Cannot find module '../log-columns-response.dto'
- Property 'getLogColumnsByActionTypeId' does not exist on ActionLogsController
- Property 'getLogColumnsByActionTypeId' does not exist on ActionLogsService

**Status**: RED phase confirmed ✓

---

## Next Steps

1. **Create DTOs** (`log-columns-response.dto.ts`)
2. **Update Repository Interface** (add method signature)
3. **Implement Repository** (Prisma queries with nested relations)
4. **Implement Service** (business logic and error handling)
5. **Implement Controller** (HTTP endpoint with decorators)
6. **Run Tests** (verify GREEN phase)
7. **Refactor** (optimize queries, improve error messages)

---

## Design Decisions

### Why Nested DTOs?

Using `LogColumnValidationResponseDto` nested within `LogColumnResponseDto` provides:
- Clear type safety
- Better Swagger documentation
- Validation at all levels
- Easier frontend consumption

### Why Include Function Code?

Including the actual validation function code allows:
- Dynamic frontend validation
- Consistent validation between frontend and backend
- Flexibility for custom validation logic
- Runtime validation generation

### Why isForFront Flag?

The `isForFront` flag allows:
- Filtering validations that should run on frontend
- Backend-only constraints (database, business rules)
- Optimized frontend validation performance
- Security through separation of concerns

---

## References

### Related Files

- Prisma Schema: `prisma/schema.prisma`
- Existing Controller: `src/action-logs/controllers/action-logs.controller.ts`
- Existing Service: `src/action-logs/services/action-logs.service.ts`
- Existing Repository Interface: `src/action-logs/interfaces/action-logs-repository.interface.ts`

### Similar Endpoints

- GET `/action-logs` - List action logs with pagination
- GET `/action-logs/:id` - Get single action log

### Documentation Standards

- Follow NestJS best practices
- Use Swagger/OpenAPI decorators
- Include comprehensive JSDoc comments
- Follow Clean Architecture principles

---

## Test Patterns Used

1. **Arrange-Act-Assert (AAA)**: Clear test structure
2. **Test Fixtures**: Reusable mock data creators
3. **Descriptive Names**: Tests read like specifications
4. **Edge Case Coverage**: Boundary conditions tested
5. **Error Scenarios**: All error paths covered
6. **Integration Testing**: Full HTTP request/response cycle
7. **Mocking Strategy**: Repository mocked, business logic tested

---

**Document Version**: 1.0
**Last Updated**: 2025-12-23
**Status**: Ready for GREEN phase implementation
