/**
 * Vitest Setup File
 *
 * This file runs before each test file.
 * It configures the testing environment and imports necessary utilities.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});
