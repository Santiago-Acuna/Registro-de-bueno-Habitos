# Validation Logic Refactoring - Epic Summary

## Overview
This epic refactors the validation logic for global entity identifiers from being scattered across repositories and services into a centralized, reusable domain validator following DDD and Clean Architecture principles.

## Business Value
- **Consistency**: Single source of truth for validation rules
- **Maintainability**: Validation logic in one place, easier to modify
- **Testability**: Isolated validation logic with comprehensive tests
- **Correctness**: Different validation strategies for habits (global uniqueness) vs action types (per-habit uniqueness)
- **Clean Architecture**: Proper separation of concerns across layers

## Current Problems

### 1. Bypassed Validation
Both `HabitsRepository` and `ActionTypesRepository` create global entity identifiers directly via Prisma without any validation:
```typescript
// HabitsRepository.ts:43-50
const globalIdentifier = await this.prisma.globalEntityIdentifiers.create({
  data: {
    name: data.name,  // NO VALIDATION!
    icon: data.icon,  // NO VALIDATION!
    // ...
  }
});
```

### 2. Validation Logic Locked in Service
`GlobalEntityIdentifiersService` contains 65+ lines of validation logic that should be reusable but isn't accessible to repositories.

### 3. Different Uniqueness Rules Not Enforced
- **Habits**: Name and icon must be globally unique across ALL habits
- **ActionTypes**: Name and icon must be unique per-habit (same name allowed for different habits)

Currently, this distinction is not properly enforced at the repository level.

## Solution Architecture

### Domain Layer (Core)
```
src/domain/
├── validators/
│   └── global-identifier.validator.ts         # Pure domain validation logic
├── interfaces/
│   └── global-identifier-validation-repository.interface.ts
└── value-objects/
    ├── identifier-name.ts                      # Existing
    └── identifier-icon.ts                      # Existing
```

### Infrastructure Layer
```
src/infrastructure/database/repositories/
└── global-identifier-validation.repository.ts  # Prisma implementation
```

### Application Layer (Uses Validator)
```
src/habits/repositories/habits.repository.ts
src/action-types/repositories/action-types.repository.ts
src/global-entity-identifiers/services/global-entity-identifiers.service.ts
```

## Validation Strategies

### Strategy 1: Global Uniqueness (Habits)
```typescript
validator.validateForHabit(name, icon, excludeId?)
```
- Name must be unique across ALL habits
- Icon must be unique across ALL habits
- Used by: HabitsRepository, GlobalEntityIdentifiersService (for habits)

### Strategy 2: Per-Habit Uniqueness (ActionTypes)
```typescript
validator.validateForActionType(name, icon, habitId, excludeId?)
```
- Name must be unique within the SAME habit only
- Icon must be unique within the SAME habit only
- Different habits can have action types with same name/icon
- Used by: ActionTypesRepository, GlobalEntityIdentifiersService (for action types)

## User Stories Breakdown

| Story | Title | Complexity | Dependencies | Focus |
|-------|-------|------------|--------------|-------|
| US-001 | Create GlobalIdentifierValidator Domain Service | Large | None | Domain validator with two strategies |
| US-002 | Implement Validation Repository Adapter | Medium | US-001 | Prisma implementation for queries |
| US-003 | Refactor HabitsRepository to Use Validator | Medium | US-001, US-002 | Apply validation before creation |
| US-004 | Refactor ActionTypesRepository to Use Validator | Medium | US-001, US-002, US-003 | Apply per-habit validation |
| US-005 | Refactor GlobalEntityIdentifiersService | Large | US-001, US-002 | Simplify service to orchestration |
| US-006 | Update Dependency Injection Configuration | Medium | US-001-005 | NestJS module configuration |
| US-007 | Integration Testing and Cleanup | Large | US-001-006 | E2E tests, cleanup, performance |

## Execution Order

### Phase 1: Foundation (TDD - RED)
1. **US-001**: Create validator with failing tests
2. **US-002**: Create repository adapter with failing tests

### Phase 2: Implementation (TDD - GREEN)
3. Implement validator to pass tests
4. Implement repository adapter to pass tests

### Phase 3: Integration (TDD - RED then GREEN)
5. **US-003**: Refactor HabitsRepository (tests first, then implementation)
6. **US-004**: Refactor ActionTypesRepository (tests first, then implementation)
7. **US-005**: Refactor GlobalEntityIdentifiersService (tests first, then implementation)

### Phase 4: Configuration & Testing
8. **US-006**: Configure dependency injection
9. **US-007**: Integration tests, performance validation, cleanup

## Expected Outcomes

### Code Quality Improvements
- **Validation Logic**: Reduced from scattered across 3 files to 1 validator
- **Service Complexity**: GlobalEntityIdentifiersService reduced by ~60% (250 → 100 lines)
- **Test Coverage**: Validator tested in isolation with 100% coverage
- **Maintainability**: Single place to modify validation rules

### Behavioral Improvements
- **Habits**: Enforced global uniqueness for name and icon
- **ActionTypes**: Enforced per-habit uniqueness for name and icon
- **Error Messages**: Consistent, clear error messages across all entry points
- **Performance**: Optimized database queries for validation checks

### Architecture Improvements
- **Clean Architecture**: Proper layer separation (Domain → Infrastructure → Application)
- **DDD Compliance**: Validation in domain layer, no infrastructure dependencies
- **SOLID Principles**: Single Responsibility (validator only validates), Dependency Inversion (interface-based)
- **Testability**: Validator can be tested without database or framework

## Testing Strategy

### Unit Tests (Per Story)
- Validator methods tested in isolation with mocked repository
- Repository adapter tested with mocked PrismaService
- Each repository/service tested with mocked validator

### Integration Tests (US-007)
- End-to-end flows through HTTP endpoints
- Database validation queries verified
- Cross-entity scenarios tested
- Performance benchmarks validated

### Regression Tests
- All existing tests must pass
- No decrease in code coverage
- All e2e tests pass

## Success Criteria

1. All 7 user stories completed and marked as "completed"
2. All tests pass (unit, integration, e2e)
3. Code coverage maintained or increased
4. Performance benchmarks met (< 50ms per validation)
5. No duplicate validation logic remains
6. Clean architecture principles maintained
7. Application deploys and runs successfully

## Risk Mitigation

### Risk 1: Breaking Existing Functionality
- **Mitigation**: Comprehensive integration tests, run existing test suite after each story

### Risk 2: Circular Dependencies in NestJS
- **Mitigation**: Careful module design, use @Global() for domain module if needed

### Risk 3: Performance Degradation
- **Mitigation**: Performance tests in US-007, optimized database queries in US-002

### Risk 4: Complex Dependency Injection
- **Mitigation**: Clear provider configurations in US-006, integration tests verify DI works

## Notes for Developers

1. **TDD Required**: Write tests first (RED), then implementation (GREEN)
2. **No Claude in Commits**: Follow git strategy from CLAUDE.md
3. **ESLint + Prettier**: Apply before each commit
4. **Architecture Review**: US-001 should be reviewed by nodejs-programming-mentor
5. **Security Audit**: Before merging to main, run security-auditor

## Git Workflow

Each story should follow this commit pattern:
1. **Architecture/Planning**: `feat: add [feature] architecture`
2. **Tests (RED)**: `test: add [feature] tests (RED)`
3. **Implementation (GREEN)**: `feat: implement [feature] (GREEN)`
4. **Refactor**: `refactor: improve [feature]` (if needed)

Example for US-001:
```bash
git commit -m "feat: add GlobalIdentifierValidator architecture"
git commit -m "test: add GlobalIdentifierValidator tests (RED)"
git commit -m "feat: implement GlobalIdentifierValidator (GREEN)"
```

## Timeline Estimate

- **US-001**: 8-10 hours (complex domain logic, comprehensive tests)
- **US-002**: 4-6 hours (straightforward repository implementation)
- **US-003**: 4-6 hours (refactor existing code, update tests)
- **US-004**: 4-6 hours (similar to US-003)
- **US-005**: 6-8 hours (major service refactoring)
- **US-006**: 3-4 hours (module configuration, integration tests)
- **US-007**: 6-8 hours (comprehensive testing, cleanup, documentation)

**Total Estimate**: 35-48 hours (5-7 working days for one developer)

## Questions to Clarify

Before starting implementation, consider:

1. **habitId in GlobalEntityIdentifiersService**: How will action type creation pass habitId context?
2. **Backward Compatibility**: Will old API contracts change?
3. **Migration Strategy**: Any existing invalid data in database?
4. **Logging**: Should validator log validation attempts for auditing?
5. **Caching**: Should validation results be cached?

---

**Ready to Start**: Begin with US-001 following TDD methodology.
