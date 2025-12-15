# FrontConfig GET Route Tests - TDD RED Phase

## Overview
This directory contains comprehensive test suites for the new GET endpoint that returns habit lists organized by type (complexity). All tests are currently **FAILING** as expected in the RED phase of Test-Driven Development.

## Test Files Created

### 1. Controller Tests (`frontConfig.controller.spec.ts`)
**Location:** `C:\Users\Santiago\Documents\claude-context\Registro-de-bueno-Habitos\server\src\helpers\frontConfig\__tests__\frontConfig.controller.spec.ts`

**Test Coverage:**
- **Basic Functionality**
  - Controller and method definition
  - Returns habits organized by type
  - Returns empty structure when no habits exist
  - Returns only specific complexity types when others are empty
  - Handles habits with empty action types arrays
  - Handles multiple habits of the same type

- **Error Handling**
  - Propagates errors from service layer

- **Decorator Validation**
  - HTTP GET method decorator
  - Controller path decorator
  - ThrottlerGuard usage

- **Data Structure Validation**
  - Correct structure with habit names as keys
  - Action types as arrays of strings
  - Consistent structure across all complexity types

- **Edge Cases**
  - Habits with special characters in names (C++, C#, etc.)
  - Long action type names
  - Many action types for a single habit (50+ items)

**Total Test Cases:** 15+

### 2. Service Tests (`frontConfig.service.spec.ts`)
**Location:** `C:\Users\Santiago\Documents\claude-context\Registro-de-bueno-Habitos\server\src\helpers\frontConfig\__tests__\frontConfig.service.spec.ts`

**Test Coverage:**
- **Core Business Logic**
  - Service and method definition
  - Returns empty arrays when no habits exist
  - Groups habits by habitType correctly (Complex, Simple, WithoutIntervals)
  - Includes action types for complex habits
  - Includes empty action types array for habits without action types
  - Fetches action types for each habit separately
  - Handles multiple complex habits with different action types

- **Repository Interaction**
  - Only fetches active habits (isActive: true filter)
  - Only fetches active action types
  - Uses correct pagination parameters (page: 1, limit: 100)
  - Maps habit names correctly from GlobalEntityIdentifier
  - Maps action type names correctly from GlobalEntityIdentifier

- **Data Organization**
  - Returns correct structure with all three complexity types
  - Handles habits distributed across different complexity levels

- **Error Handling**
  - Handles repository errors gracefully
  - Handles action types repository errors

- **Edge Cases**
  - Habits with special characters in names
  - Action types with special characters
  - Large number of habits (100+)
  - Large number of action types for a single habit (50+)

- **Logging**
  - Verifies logging functionality (will fail until implemented)

**Total Test Cases:** 20+

### 3. DTO Tests (`habits-by-type-response.dto.spec.ts`)
**Location:** `C:\Users\Santiago\Documents\claude-context\Registro-de-bueno-Habitos\server\src\helpers\frontConfig\dto\__tests__\habits-by-type-response.dto.spec.ts`

**Test Coverage:**
- **Structure Validation**
  - DTO is defined
  - Validates properly structured response
  - Validates empty response structure
  - Has all required properties (complex, simple, withoutintervals)

- **Swagger/OpenAPI Documentation**
  - ApiProperty decorators for all fields

- **Data Structure**
  - Accepts objects with habit names as keys and action type arrays as values
  - Accepts empty action type arrays
  - Accepts multiple habits in a single category
  - Accepts habits across all three categories

- **Validation Rules**
  - Fails if complex is missing
  - Fails if simple is missing
  - Fails if withoutintervals is missing
  - Fails if complex is not an array
  - Fails if simple is not an array
  - Fails if withoutintervals is not an array

- **Edge Cases**
  - Habits with special characters in names
  - Action types with special characters
  - Long habit names
  - Many action types for a single habit (50+)
  - Many habits in a single category (50+)

- **Serialization**
  - Serializes to JSON correctly
  - Deserializes from JSON correctly

**Total Test Cases:** 22+

### 4. Integration Tests (`frontConfig.integration.spec.ts`)
**Location:** `C:\Users\Santiago\Documents\claude-context\Registro-de-bueno-Habitos\server\src\helpers\frontConfig\__tests__\frontConfig.integration.spec.ts`

**Test Coverage:**
- **HTTP Endpoint**
  - Returns 200 and empty structure when no habits exist
  - Returns habits organized by type
  - Includes action types for complex habits
  - Only returns active habits (filters out inactive)
  - Handles multiple habits of different types
  - Returns empty action types array for habits without action types

- **HTTP Headers & Status**
  - Proper HTTP status code (200)
  - Proper content-type (application/json)
  - API versioning support

- **Database Integration**
  - Creates and retrieves habits from Prisma database
  - Creates and retrieves action types from Prisma database
  - Properly links habits with global entity identifiers
  - Properly links action types with global entity identifiers

- **Error Handling**
  - Handles database connection errors gracefully

**Total Test Cases:** 9+

## Expected Response Structure

```json
{
  "complex": [
    {
      "Programming": ["for work", "personal Project"],
      "Learn english": []
    }
  ],
  "simple": [
    {
      "Morning Exercise": ["Cardio"]
    }
  ],
  "withoutintervals": [
    {
      "Daily Meditation": []
    }
  ]
}
```

## Implementation Requirements (from tests)

### Controller (`frontConfig.controller.ts`)
- [ ] Add `@Get('habits-by-type')` decorator
- [ ] Add `@Version('1')` decorator
- [ ] Implement `getHabitsByType()` method
- [ ] Return `HabitsByTypeResponseDto`
- [ ] Add Swagger/OpenAPI decorators:
  - `@ApiOperation()`
  - `@ApiResponse()`
  - `@ApiTags()`
- [ ] Use ThrottlerGuard

### Service (`frontConfig.service.ts`)
- [ ] Implement `getHabitsByType()` method
- [ ] Fetch all active habits from HabitsRepository
- [ ] For each habit, fetch active action types from ActionTypesRepository
- [ ] Group habits by habitType (HabitComplexity enum)
- [ ] Map habit names from GlobalEntityIdentifier.name
- [ ] Map action type names from GlobalEntityIdentifier.name
- [ ] Return data in HabitsByTypeResponseDto structure
- [ ] Add logging for operations

### DTO (`habits-by-type-response.dto.ts`)
- [ ] Add properties: `complex`, `simple`, `withoutintervals`
- [ ] Each property should be array of objects
- [ ] Use `@ApiProperty()` decorators for Swagger
- [ ] Use class-validator decorators:
  - `@IsArray()`
  - `@IsNotEmpty()`
- [ ] Add example values in ApiProperty

### Module (`frontConfig.module.ts`)
- [x] Import HabitsModule
- [x] Import ActionTypesModule
- [x] Add FrontConfigController to controllers array
- [x] Inject repositories into service

## Running the Tests

To verify the RED phase (all tests should fail):

```bash
cd server
npm test -- frontConfig
```

Expected output: All tests should fail with TypeScript errors indicating missing implementations.

## Next Steps (GREEN Phase)

After implementing the functionality:

1. Run tests again: `npm test -- frontConfig`
2. All tests should pass
3. Verify code coverage: `npm run test:cov`
4. Run integration tests: `npm test -- frontConfig.integration`

## Clean Architecture Adherence

These tests follow the Clean Architecture pattern:

- **Controller Layer:** Thin controller delegates to service
- **Application Layer:** Service orchestrates domain operations
- **Domain Layer:** Uses domain entities (Habit, ActionType, GlobalEntityIdentifier)
- **Repository Pattern:** Abstracts data access via IHabitsRepository and IActionTypesRepository
- **Dependency Injection:** Uses NestJS IoC container

## Test Quality Standards

All tests follow these principles:

- **Arrange-Act-Assert (AAA) Pattern:** Clear test structure
- **Descriptive Test Names:** Read like specifications
- **Independent Tests:** No dependencies between tests
- **Mocked Dependencies:** Repository and service mocks
- **Type Safety:** Full TypeScript type checking
- **Edge Case Coverage:** Special characters, large datasets, error conditions
