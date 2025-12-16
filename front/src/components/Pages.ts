/**
 * Component Mapping Barrel Export
 *
 * Purpose: Maps component names to React components for dynamic route rendering.
 * Pattern: Named exports for tree-shaking and type-safe component lookup.
 *
 * Usage in App.tsx:
 * const Component = Pages[route.component as PageComponentName];
 */

// Current Components
export { default as ComplexHabits } from './complex habits/complex-habits';
export { default as CreateHabits } from './createHabit/createHabit';
export { default as HabitsSelection } from './habitsSelection/habitsSelection';

// Future Components (to be implemented):
// export { default as SimpleHabits } from './simpleHabits/simpleHabits';
// export { default as WithoutIntervalsHabits } from './withoutIntervalsHabits/withoutIntervalsHabits';
