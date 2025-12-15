# Database Error Handling Improvement - Sprint

## Overview
This sprint improves user-facing error messages when database unique constraints are violated, without duplicating validation logic.

## Business Value
- **Better UX**: Non-developers get clear, actionable error messages
- **Simpler Architecture**: Database remains single source of truth for uniqueness
- **Better Performance**: No duplicate validation queries before inserts/updates
- **Easier Maintenance**: One place to update (exception filter), not multiple validators

## The Problem We're Solving

### Current State
When users violate unique constraints (duplicate name/icon), they receive:
```json
{
  "message": "A record with this unique field already exists"
}
```

This is too generic - users don't know WHICH field is the problem.

### Desired State
Users should receive specific, helpful messages:
```json
{
  "message": "The name is already in use. Please choose a different name."
}
```

## Solution Approach

### ✅ What We're Doing
- Improve `HttpExceptionFilter` to parse Prisma P2002 errors
- Extract field names from `exception.meta.target`
- Return field-specific error messages
- Maintain 409 CONFLICT status code

### ❌ What We're NOT Doing
- Application-layer validation before database operations
- Pre-checking database for duplicates
- Domain validators or validation services
- Duplicate validation logic

## Why This Approach?

**Database constraints already exist** (see `tu_archivo_esquema.sql`):
- `global_entity_identifiers_name_unique` - enforces unique names
- `global_entity_identifiers_icon_unique` - enforces unique icons
- `global_entity_identifiers_name_icon_unique` - composite constraint

**Validating twice would be:**
- ❌ Duplicate code (DRY violation)
- ❌ Extra database queries (performance overhead)
- ❌ Two sources of truth (maintenance burden)
- ❌ Potential inconsistencies (race conditions)

**Improving error handling is:**
- ✅ Single source of truth (database)
- ✅ No extra queries (better performance)
- ✅ Simple to maintain (one file)
- ✅ User-friendly messages (better UX)

## User Stories

| Story | Title | Complexity | Status |
|-------|-------|------------|--------|
| US-001 | Improve Database Error Handling for Users | Small | Pending |

## Execution Plan

### Phase 1: TDD - RED
1. Write failing tests for P2002 error message formatting
2. Test single field conflicts (name, icon)
3. Test composite constraint conflicts
4. Test edge cases (missing meta, empty target)

### Phase 2: TDD - GREEN
5. Implement `buildUniqueConstraintMessage()` helper
6. Update `handlePrismaException()` to use helper
7. Add field information to details object
8. All tests pass

### Phase 3: Integration Testing
9. E2E tests for duplicate name/icon scenarios
10. Verify error messages in actual API responses
11. Manual testing for UX validation

### Phase 4: Cleanup
12. Code review and refactoring
13. Documentation updates
14. Git commit following TDD workflow

## Expected Outcomes

### Code Changes
- **Files Modified**: 2 files
  - `src/infrastructure/filters/http-exception.filter.ts` (~30 lines added)
  - `src/infrastructure/filters/__tests__/http-exception.filter.spec.ts` (~100 lines tests)

### Test Coverage
- 100% coverage for new `buildUniqueConstraintMessage()` method
- Edge cases covered (missing meta, empty arrays, multiple fields)

### User Experience
- Clear error messages for all unique constraint violations
- Non-developers can understand and fix errors
- No technical jargon in user-facing messages

## Git Workflow

Following TDD methodology from `server/CLAUDE.md`:

```bash
# Phase 1: Tests (RED)
git add .
git commit -m "test: add P2002 error message formatting tests (RED)"

# Phase 2: Implementation (GREEN)
git add .
git commit -m "feat: improve database error messages for users (GREEN)"

# Phase 3: Refinement (if needed)
git add .
git commit -m "refactor: enhance error message clarity"
```

**Rules:**
- ❌ NO Claude mentions in commits
- ✅ ALWAYS run ESLint + Prettier before commit
- ✅ ALWAYS ensure tests pass before commit
- ✅ Commits to `back-end` branch

## Timeline Estimate

- **US-001**: 2-3 hours (simple change, comprehensive tests)

**Total Estimate**: 2-3 hours

## Comparison with Previous Approach

### Old Approach (2025-12-12 User Stories)
- 7 user stories
- 35-48 hours estimated
- Domain validator + repository adapter + refactoring
- Duplicate validation logic
- Pre-validation database queries
- Complex dependency injection

### New Approach (This Sprint)
- 1 user story
- 2-3 hours estimated
- Single file modification
- No duplicate logic
- No extra queries
- Simple, focused change

**Savings**: ~45 hours of development time, simpler architecture, better performance

## Success Criteria

1. ✅ All P2002 errors return field-specific messages
2. ✅ Non-developers understand errors without technical knowledge
3. ✅ No duplicate validation in codebase
4. ✅ No performance degradation
5. ✅ All tests pass (unit + integration)
6. ✅ Code coverage maintained
7. ✅ ESLint and Prettier compliant

## References

- **Database Schema**: `../../tu_archivo_esquema.sql` (lines 699-719)
- **Current Filter**: `src/infrastructure/filters/http-exception.filter.ts`
- **Architecture Guide**: `server/CLAUDE.md`
- **Prisma Errors**: https://www.prisma.io/docs/reference/api-reference/error-reference#p2002

---

**Ready to Start**: Begin with US-001 following TDD methodology (RED → GREEN → REFACTOR)
