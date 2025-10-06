# Testing Setup Guide - CH-001

## Overview
This document describes the testing infrastructure setup for the habit tracking frontend application, specifically for user story CH-001: Create hooks directory structure.

## Testing Framework
- **Vitest**: Fast, Vite-native testing framework
- **React Testing Library**: User-centric component testing
- **Happy-DOM**: Lightweight DOM implementation
- **@testing-library/jest-dom**: Enhanced matchers

## Installation

```bash
cd front
npm install
```

This will install all testing dependencies defined in `package.json`:
- `vitest`: Core testing framework
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers
- `@vitest/ui`: Optional UI for test visualization
- `happy-dom`: DOM implementation for tests

## Test Scripts

```bash
# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Configuration Files

### `vitest.config.ts`
Main Vitest configuration with:
- React plugin integration
- Happy-DOM environment
- Global test APIs
- Path aliases (@, hooks)
- Coverage settings

### `tsconfig.vitest.json`
TypeScript configuration for tests:
- Extends `tsconfig.app.json`
- Includes Vitest global types
- Includes @testing-library/jest-dom types
- Covers all test files

### `src/test/setup.ts`
Global test setup:
- Imports @testing-library/jest-dom matchers
- Configures cleanup after each test
- Runs before each test file

## Test File Organization

```
src/hooks/__tests__/
├── hooks-directory-structure.test.ts    # File system tests
├── hooks-barrel-export.test.ts          # Barrel export tests
├── hooks-typescript-config.test.ts      # TypeScript config tests
└── hooks-integration.test.tsx           # Integration tests
```

## Current Status: RED Phase

All tests are currently **FAILING** as expected in TDD RED phase. This is intentional and correct.

### Why Tests Fail
- `src/hooks/` directory does NOT exist yet
- `src/hooks/index.ts` file does NOT exist yet
- TypeScript paths NOT configured yet

### Expected Failures
1. **Directory Structure Tests**: Directory not found
2. **Barrel Export Tests**: File not found, import failures
3. **TypeScript Config Tests**: Import resolution failures
4. **Integration Tests**: Module not found errors

## Running Tests (RED Phase Verification)

```bash
npm run test:run
```

**Expected Output**: All tests should FAIL with clear error messages about missing files and directories.

## Next Steps (GREEN Phase)

After verifying RED phase, the implementation phase will:
1. Create `src/hooks/` directory
2. Create `src/hooks/index.ts` barrel export file
3. Update TypeScript configuration if needed
4. Re-run tests to achieve GREEN phase (all passing)

## Test Coverage

Current test suite covers:
- File system structure and permissions
- Barrel export functionality
- TypeScript configuration and module resolution
- React integration and hook testing infrastructure
- Import patterns and path aliases
- Error handling and edge cases
- React 19 compatibility

## Testing Best Practices

1. **Arrange-Act-Assert**: All tests follow AAA pattern
2. **Descriptive Names**: Tests read like specifications
3. **Independence**: Tests can run in any order
4. **No Implementation Details**: Tests focus on behavior
5. **Clear Assertions**: Meaningful error messages

## Troubleshooting

### Tests not found
```bash
# Ensure you're in the front directory
cd front
npm install
npm test
```

### Module resolution errors
```bash
# Check that vitest.config.ts has path aliases configured
# Check that tsconfig files are properly referenced
```

### Happy-DOM errors
```bash
# Ensure happy-dom is installed
npm install --save-dev happy-dom
```

## References
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
