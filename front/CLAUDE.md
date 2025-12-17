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

## Custom Hooks Pattern

The application uses custom React hooks to encapsulate business logic and Redux state management, providing a clean separation between UI components and state logic.

### Available Hooks

#### `useBooks`

**Purpose:** Manages book-related state and operations through Redux.

**Returns:**

- `books`: Array of all books
- `bookInfo`: Current book being edited/viewed
- `bookID`: ID of the selected book
- `formState`: Current form state ("CREATE" | "UPDATE")
- `fetchBooks()`: Fetch all books from API
- `createBook(book)`: Create a new book
- `updateBook(book)`: Update an existing book
- `manageForm(state)`: Set form state
- `getInfo(book)`: Set book info for editing

**Usage:**

```typescript
import { useBooks } from '@/hooks';

function BookManager() {
  const { books, fetchBooks, createBook } = useBooks();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return <BookList books={books} onCreate={createBook} />;
}
```

#### `useHabits`

**Purpose:** Manages habit-related state and CRUD operations.

**Usage:**

```typescript
import { useHabits } from "@/hooks";

function HabitList() {
  const { habits, isLoading, error } = useHabits();
  // Component logic
}
```

#### `useHabitForm`

**Purpose:** Handles habit form state and validation logic.

**Usage:**

```typescript
import { useHabitForm } from "@/hooks";

function CreateHabit() {
  const { formData, handleChange, handleSubmit } = useHabitForm();
  // Form logic
}
```

#### `useHabitMutations`

**Purpose:** Provides methods for creating, updating, and deleting habits.

**Usage:**

```typescript
import { useHabitMutations } from "@/hooks";

function HabitActions() {
  const { createHabit, updateHabit, deleteHabit } = useHabitMutations();
  // Mutation logic
}
```

#### `useReadingLogs`

**Purpose:** Manages reading log entries for book tracking.

**Usage:**

```typescript
import { useReadingLogs } from "@/hooks";

function ReadingTracker() {
  const { logs, addLog, updateLog } = useReadingLogs();
  // Reading log logic
}
```

#### `useHabitsFilter`

**Purpose:** Provides filtering and sorting functionality for habit lists.

**Usage:**

```typescript
import { useHabitsFilter } from "@/hooks";

function FilteredHabits() {
  const { filteredHabits, setFilter, setSortBy } = useHabitsFilter();
  // Filter logic
}
```

### Custom Hooks Best Practices

1. **Single Responsibility:** Each hook should handle one specific domain (books, habits, etc.)
2. **Redux Integration:** Hooks encapsulate Redux logic, keeping components clean
3. **Stable References:** Use `useCallback` for returned functions to prevent unnecessary re-renders
4. **Type Safety:** All hooks are fully typed with TypeScript
5. **Testability:** Hooks are tested independently using `@testing-library/react-hooks`
6. **Composition:** Hooks can be composed together in components as needed

### When to Use Custom Hooks

- **Use custom hooks when:**
  - You need to access Redux state in multiple components
  - Business logic needs to be shared across components
  - Complex state management requires abstraction
  - You want to keep components focused on UI presentation

- **Don't create custom hooks when:**
  - Logic is only used in one component
  - Simple state can be managed with `useState`
  - You're just wrapping a single Redux selector

### Hook Composition Example

```typescript
function BookHabitTracker() {
  // Compose multiple hooks for complex features
  const { books, fetchBooks } = useBooks();
  const { habits, createHabit } = useHabits();
  const { filteredHabits, setFilter } = useHabitsFilter();

  // Component logic using multiple hooks
}
```

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
