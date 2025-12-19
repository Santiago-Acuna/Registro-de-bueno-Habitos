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
export { default as ComplexHabits } from "./complex-habits/complex-habits";
export { default as WithoutIntervalsHabits } from "./without-intervals-habits/without-intervals-habits";
export { default as CreateHabits } from "./create-habit/create-habit";
export { default as HabitsSelection } from "./habits-selection/habits-selection";

// Future Components (to be implemented):
// export { default as SimpleHabits } from './simpleHabits/simpleHabits';
