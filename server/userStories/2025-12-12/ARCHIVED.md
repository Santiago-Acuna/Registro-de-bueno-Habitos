# ARCHIVED - Validation Logic Refactoring Epic

**Date Archived**: 2025-12-14
**Reason**: Superseded by simpler approach
**New Location**: `../2025-12-14/`

## Why These User Stories Were Archived

After analysis, we determined that the proposed validation approach was **over-engineered** and violated the **DRY (Don't Repeat Yourself)** principle.

### Problems with Original Approach

1. **Duplicate Validation**
   - Database already has unique constraints on name and icon (`tu_archivo_esquema.sql`)
   - Application-layer validation would duplicate this logic
   - Pre-checking before insert/update adds unnecessary database queries

2. **Complexity**
   - 7 user stories
   - 35-48 hours of development time
   - Domain validators, repository adapters, dependency injection refactoring
   - Multiple layers of validation logic

3. **Performance Overhead**
   - Extra validation queries before every insert/update
   - Race conditions possible between validation check and insert

4. **Maintenance Burden**
   - Two sources of truth (application validator + database constraints)
   - Changes require updating multiple files
   - Risk of validation logic getting out of sync

## The Better Solution

Instead of duplicating validation, we **improved error handling** to make database errors user-friendly.

### New Approach (2025-12-14)
- Single user story
- 2-3 hours of development
- Modify `HttpExceptionFilter` to parse P2002 errors
- Extract field names from Prisma metadata
- Return clear, actionable error messages

### Benefits
- ✅ Database remains single source of truth
- ✅ No duplicate validation logic
- ✅ No extra database queries
- ✅ Better performance
- ✅ Easier to maintain
- ✅ User-friendly error messages

### Example Outcome

**Before**:
```json
{
  "message": "A record with this unique field already exists"
}
```

**After**:
```json
{
  "message": "The name is already in use. Please choose a different name."
}
```

## Original User Stories (Not Implemented)

1. ❌ US-001: Create GlobalIdentifierValidator Domain Service
2. ❌ US-002: Implement Validation Repository Adapter
3. ❌ US-003: Refactor HabitsRepository to Use Validator
4. ❌ US-004: Refactor ActionTypesRepository to Use Validator
5. ❌ US-005: Refactor GlobalEntityIdentifiersService to Use Validator
6. ❌ US-006: Update Dependency Injection Configuration
7. ❌ US-007: Integration Testing and Cleanup

**Total Estimated Time**: 35-48 hours (not spent)

## Lessons Learned

1. **Question Complexity**: Always ask if there's a simpler solution
2. **Single Source of Truth**: Leverage existing database constraints
3. **Avoid Duplication**: Don't validate data twice (app + database)
4. **User Experience**: Improve error messages instead of adding validation layers
5. **YAGNI Principle**: You Aren't Gonna Need It - don't over-engineer

## References

- **New User Stories**: `../2025-12-14/README.md`
- **Database Constraints**: `../../tu_archivo_esquema.sql` (lines 699-719)
- **Discussion**: This decision was made after reviewing database schema and recognizing existing uniqueness constraints

---

**Status**: ARCHIVED - Do not implement these user stories.
**Alternative**: See `../2025-12-14/1.improve_database_error_handling_for_users.pending.md`
