# Frontend CLAUDE.md

This file provides guidance for working with the React frontend of the habit tracking application.

## Frontend Architecture

**Technology Stack:**

- React 19 with TypeScript
- Vite for build tooling and development server
- Redux Toolkit for state management
- Material-UI (@mui/material) for UI components
- Axios for HTTP requests
- React Router for client-side routing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── complex habits/  # Complex habit management components
│   ├── createHabit/     # Habit creation components
│   └── utils/           # Utility components
├── redux/               # State management
│   └── slices/          # Redux Toolkit slices
│       ├── book/        # Book-related state
│       └── habits/      # Habits state management
├── habits-types.ts      # TypeScript type definitions
└── App.tsx             # Main application component
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## State Management

- Uses Redux Toolkit for predictable state management
- Async actions handled with createAsyncThunk
- Slices organized by feature (habits, books)

## Component Patterns

- Functional components with React hooks
- TypeScript interfaces for props and state
- CSS modules for component styling
- Material-UI components for consistent design

## API Integration

- Axios client configured for backend communication
- Async actions in Redux slices handle API calls
- Error handling and loading states managed in Redux

## Development Guidelines

- Follow TypeScript strict mode
- Keep components focused and reusable
- Handle loading and error states in UI
- Use CSS modules for component-specific styles

## Development Workflow

**Phase 1: Architecture & Planning**

1. react-programming-mentor: Architectural guidance - USE for complex decisions
2. user-story-creator: User Stories - USE for create new tasks
3. git-workflow-manager: Commit - USE after each phase

**Phase 2: Test-Driven Development** 4. react-tdd-test-first: Create tests - USE for each task 5. git-workflow-manager: Commit RED phase 6. react-test-implementer: Implement - USE after tests fail 7. git-workflow-manager: Commit GREEN phase

**Phase 3: Quality & Security** 8. security-auditor: Audit - USE before main merge 9. git-workflow-manager: Commit fixes 10. accessibility-auditor: WCAG - USE after UI complete 11. git-workflow-manager: Commit improvements

**Git Strategy (NO Claude mentions)**

- Architecture: "feat: add [feature] architecture"
- Tests: "test: add [feature] tests (RED)"
- Implementation: "feat: implement [feature] (GREEN)"
- Security: "fix: security improvements"
- A11Y: "feat: improve accessibility"

**RULES**

- NEVER write code without concrete functionality
- NEVER implement without failing tests
- NEVER mention Claude in commits
- ALWAYS apply ESLint + Prettier
- ALWAYS Git commits about files from the front folder go to the front-end branch.
