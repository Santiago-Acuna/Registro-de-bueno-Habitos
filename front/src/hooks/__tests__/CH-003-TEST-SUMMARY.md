# CH-003: Hooks Directory Structure - Test Summary

## RED Phase Complete ✓

All tests have been created and are currently **FAILING** as expected in the Test-Driven Development RED phase.

## Test Files Created

### 1. hooksDirectoryStructure.test.ts

**Purpose**: Validates the overall hooks directory structure and organization

**Test Coverage**:

- Directory existence and organization (3 tests)
- Barrel export pattern validation (6 tests)
- Naming conventions enforcement (4 tests)
- Hook file organization (4 tests)
- TypeScript type safety (2 tests)
- Hook organization best practices (3 tests)
- Documentation and comments (2 tests)
- Integration with project structure (3 tests)
- Scalability and maintainability (3 tests)

**Total Tests**: 30

### 2. useHabits.test.ts

**Purpose**: Tests the useHabits hook for fetching habits from the backend API

**Test Coverage**:

- Hook existence and structure (3 tests)
- Initial state and data fetching (4 tests)
- Loading states (4 tests)
- Error handling (6 tests)
- Data transformation (backend to frontend) (4 tests)
- Caching and refetching (4 tests)
- Query parameters and filtering (3 tests)
- Integration with React Query (3 tests)
- Performance and optimization (3 tests)

**Total Tests**: 34

### 3. useHabitMutations.test.ts

**Purpose**: Tests the useHabitMutations hook for creating, updating, and deleting habits

**Test Coverage**:

- Hook existence and structure (4 tests)
- Create habit mutation (8 tests)
- Update habit mutation (7 tests)
- Delete habit mutation (6 tests)
- Optimistic updates (4 tests)
- Cache invalidation (4 tests)
- Concurrent mutations (3 tests)
- TypeScript type safety (3 tests)

**Total Tests**: 39

### 4. useReadingLogs.test.ts

**Purpose**: Tests the useReadingLogs hook for fetching reading logs data

**Test Coverage**:

- Hook existence and structure (3 tests)
- Initial state and data fetching (4 tests)
- Loading states (4 tests)
- Error handling (6 tests)
- Filtering by habit ID (3 tests)
- Date range filtering (4 tests)
- Pagination support (3 tests)
- Data transformation (3 tests)
- Sorting and ordering (3 tests)
- Combined filters (2 tests)
- Cache management (3 tests)
- Performance and optimization (2 tests)
- TypeScript type safety (2 tests)

**Total Tests**: 42

## Test Results Summary

**Total Test Files**: 4 new files (plus existing useHabitForm.test.ts)
**Total New Tests**: 145
**Current Status**: ✓ All failing (RED phase)
**Tests Passing**: 0/145 (expected)
**Tests Failing**: 145/145 (expected in RED phase)

## Key Failures (Expected)

1. **Missing Hook Exports**: useHabits, useHabitMutations, useReadingLogs not exported from barrel
2. **Missing Hook Files**: Hook implementation files don't exist yet
3. **Missing Hook Functionality**: All hooks need to be implemented

## Next Steps (GREEN Phase)

To move to the GREEN phase, implement the following:

### 1. Create Hook Files

```
front/src/hooks/
├── index.ts (update barrel exports)
├── useHabits.ts (NEW)
├── useHabitMutations.ts (NEW)
├── useReadingLogs.ts (NEW)
└── useHabitForm.ts (existing)
```

### 2. Update index.ts Barrel Exports

Add the following exports:

```typescript
export { useHabits } from "./useHabits";
export { useHabitMutations } from "./useHabitMutations";
export { useReadingLogs } from "./useReadingLogs";
```

### 3. Implement useHabits Hook

**Requirements**:

- Fetch habits from `/api/habits` endpoint
- Use React Query or similar for server state
- Support filtering by habit type
- Support pagination (page, limit)
- Support sorting (sortBy, order)
- Handle loading and error states
- Transform backend data to frontend format
- Cache data appropriately

### 4. Implement useHabitMutations Hook

**Requirements**:

- `createHabit`: POST to `/api/habits`
- `updateHabit`: PATCH to `/api/habits/:id`
- `deleteHabit`: DELETE to `/api/habits/:id`
- Individual loading states (isCreating, isUpdating, isDeleting)
- Individual error states for each mutation
- Support optimistic updates
- Invalidate cache after successful mutations
- Handle concurrent mutations properly

### 5. Implement useReadingLogs Hook

**Requirements**:

- Fetch reading logs from `/api/reading-logs` endpoint
- Support filtering by habitId
- Support date range filtering (startDate, endDate)
- Support pagination (page, limit)
- Support sorting (sortBy, order)
- Handle loading and error states
- Transform backend data to frontend format
- Cache with proper invalidation

## Technology Stack Recommendations

Based on the test specifications, the following libraries are recommended:

### Option 1: React Query (TanStack Query)

**Recommended** - Best fit based on test patterns

- `@tanstack/react-query`: Server state management
- Built-in caching, refetching, loading states
- Optimistic updates support
- Perfect match for test expectations

### Option 2: SWR

Alternative if React Query is not preferred

- Similar features
- Simpler API
- Good caching strategies

### Installation

```bash
npm install @tanstack/react-query
```

## Backend Integration Notes

Based on the tests, the hooks should integrate with these NestJS endpoints:

### Habits API

- `GET /api/habits` - Fetch all habits
- `GET /api/habits?habitType=Simple` - Filter by type
- `GET /api/habits?page=1&limit=10` - Pagination
- `POST /api/habits` - Create habit
- `PATCH /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Reading Logs API

- `GET /api/reading-logs` - Fetch all logs
- `GET /api/reading-logs?habitId=xxx` - Filter by habit
- `GET /api/reading-logs?startDate=xxx&endDate=xxx` - Date range
- `GET /api/reading-logs?page=1&limit=10` - Pagination
- `GET /api/reading-logs?sortBy=date&order=desc` - Sorting

## Data Transformation Requirements

### Backend Format (NestJS) → Frontend Format

**Habit**:

```typescript
// Backend (NestJS)
{
  id: string,
  name: string,
  iconUrl: string,      // Transform to 'icon'
  habitType: string,    // Transform to 'habit_type'
  createdAt: string,
  updatedAt: string
}

// Frontend
{
  id: string,
  name: string,
  icon: string,
  habit_type: string
}
```

**Reading Log**:

```typescript
// Backend (NestJS)
{
  id: string,
  habitId: string,
  pagesRead: number,    // Transform to 'pages'
  readDate: string,     // Transform to 'date'
  createdAt: string,
  updatedAt: string
}

// Frontend
{
  id: string,
  habitId: string,
  pages: number,
  date: string
}
```

## Test Execution Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run only CH-003 tests
npm run test:run -- hooks/__tests__/useHabits.test.ts
npm run test:run -- hooks/__tests__/useHabitMutations.test.ts
npm run test:run -- hooks/__tests__/useReadingLogs.test.ts
npm run test:run -- hooks/__tests__/hooksDirectoryStructure.test.ts
```

## User Story Acceptance Criteria

- [x] Tests created following TDD RED phase
- [ ] All hooks exported from barrel (index.ts)
- [ ] useHabits hook implemented with backend integration
- [ ] useHabitMutations hook implemented with CRUD operations
- [ ] useReadingLogs hook implemented with filtering
- [ ] All tests passing (GREEN phase)
- [ ] Code follows TypeScript strict mode
- [ ] Proper error handling throughout
- [ ] Loading states properly managed
- [ ] Data properly transformed between backend/frontend

## Additional Notes

1. **React Query Setup**: Will need QueryClient provider in app root
2. **Axios Configuration**: Backend base URL configuration needed
3. **Type Definitions**: May need to create/update type definitions for API responses
4. **Error Boundaries**: Consider adding error boundaries for hook error handling
5. **Suspense**: Consider using React Suspense for loading states (React 19 feature)

## Files Modified/Created

### Created

- `front/src/hooks/__tests__/hooksDirectoryStructure.test.ts`
- `front/src/hooks/__tests__/useHabits.test.ts`
- `front/src/hooks/__tests__/useHabitMutations.test.ts`
- `front/src/hooks/__tests__/useReadingLogs.test.ts`
- `front/src/hooks/__tests__/CH-003-TEST-SUMMARY.md` (this file)

### To Be Created (GREEN Phase)

- `front/src/hooks/useHabits.ts`
- `front/src/hooks/useHabitMutations.ts`
- `front/src/hooks/useReadingLogs.ts`

### To Be Modified (GREEN Phase)

- `front/src/hooks/index.ts` (add new exports)

---

**Status**: RED PHASE COMPLETE ✓
**Next**: Proceed to GREEN phase implementation
**Author**: TDD Specialist
**Date**: 2025-01-07
