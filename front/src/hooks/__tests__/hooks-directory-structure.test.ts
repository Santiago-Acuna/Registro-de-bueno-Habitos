/**
 * CH-001: Hooks Directory Structure Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies that the hooks directory infrastructure exists
 * and follows the project's organizational conventions.
 *
 * User Story: As a frontend developer, I need a hooks directory structure
 * so that custom React hooks can be organized and easily imported.
 */

import { describe, it, expect } from "vitest";
import { existsSync, statSync, accessSync, constants } from "fs";
import { resolve } from "path";

describe("CH-001: Hooks Directory Structure", () => {
  // Define absolute paths for the hooks directory
  const PROJECT_ROOT = resolve(__dirname, "../../..");
  const HOOKS_DIR = resolve(PROJECT_ROOT, "src/hooks");
  const HOOKS_INDEX = resolve(HOOKS_DIR, "index.ts");

  describe("Directory Existence", () => {
    it("should have a hooks directory at src/hooks/", () => {
      // Arrange: Get the expected directory path
      const hooksPath = HOOKS_DIR;

      // Act: Check if the directory exists
      const directoryExists = existsSync(hooksPath);

      // Assert: The directory must exist
      expect(directoryExists).toBe(true);
    });

    it("should ensure src/hooks/ is actually a directory, not a file", () => {
      // Arrange: Get the hooks path
      const hooksPath = HOOKS_DIR;

      // Act: Check if path exists and get its stats
      const exists = existsSync(hooksPath);

      // Assert: Path exists and is a directory
      expect(exists).toBe(true);
      if (exists) {
        const stats = statSync(hooksPath);
        expect(stats.isDirectory()).toBe(true);
      }
    });
  });

  describe("Directory Permissions", () => {
    it("should have read permissions on hooks directory", () => {
      // Arrange: Get the hooks directory path
      const hooksPath = HOOKS_DIR;

      // Act & Assert: Check if directory is readable
      expect(() => {
        accessSync(hooksPath, constants.R_OK);
      }).not.toThrow();
    });

    it("should have write permissions on hooks directory", () => {
      // Arrange: Get the hooks directory path
      const hooksPath = HOOKS_DIR;

      // Act & Assert: Check if directory is writable
      expect(() => {
        accessSync(hooksPath, constants.W_OK);
      }).not.toThrow();
    });
  });

  describe("Index File Existence", () => {
    it("should have an index.ts file in the hooks directory", () => {
      // Arrange: Get the expected index file path
      const indexPath = HOOKS_INDEX;

      // Act: Check if the index file exists
      const fileExists = existsSync(indexPath);

      // Assert: The index.ts file must exist
      expect(fileExists).toBe(true);
    });

    it("should ensure index.ts is a file, not a directory", () => {
      // Arrange: Get the index.ts path
      const indexPath = HOOKS_INDEX;

      // Act: Check if path exists and get its stats
      const exists = existsSync(indexPath);

      // Assert: Path exists and is a file
      expect(exists).toBe(true);
      if (exists) {
        const stats = statSync(indexPath);
        expect(stats.isFile()).toBe(true);
      }
    });

    it("should have read permissions on index.ts file", () => {
      // Arrange: Get the index file path
      const indexPath = HOOKS_INDEX;

      // Act & Assert: Check if file is readable
      expect(() => {
        accessSync(indexPath, constants.R_OK);
      }).not.toThrow();
    });
  });

  describe("Directory Organization", () => {
    it("should be located directly under src/ directory", () => {
      // Arrange: Get parent directory of hooks
      const hooksPath = HOOKS_DIR;
      const parentDir = resolve(hooksPath, "..");
      const srcDir = resolve(PROJECT_ROOT, "src");

      // Act: Compare parent directory with src directory
      const isDirectlyUnderSrc = parentDir === srcDir;

      // Assert: hooks should be directly under src/
      expect(isDirectlyUnderSrc).toBe(true);
    });

    it("should follow the same naming convention as other directories (lowercase)", () => {
      // Arrange: Get the directory name
      const hooksPath = HOOKS_DIR;
      const dirName = hooksPath.split(/[\\/]/).pop();

      // Act: Check if directory name is lowercase
      const isLowercase = dirName === dirName?.toLowerCase();

      // Assert: Directory name should be lowercase
      expect(isLowercase).toBe(true);
      expect(dirName).toBe("hooks");
    });
  });

  describe("Infrastructure Readiness", () => {
    it("should have the necessary structure to export custom hooks", () => {
      // Arrange: Check for both directory and index file
      const hooksPath = HOOKS_DIR;
      const indexPath = HOOKS_INDEX;

      // Act: Verify both exist
      const directoryExists = existsSync(hooksPath);
      const indexExists = existsSync(indexPath);

      // Assert: Both directory and index must exist for hook exports
      expect(directoryExists).toBe(true);
      expect(indexExists).toBe(true);
    });

    it("should allow creation of new hook files in the directory", () => {
      // Arrange: Get the hooks directory
      const hooksPath = HOOKS_DIR;

      // Act: Check directory exists and is writable
      const exists = existsSync(hooksPath);
      const isWritable = () => {
        accessSync(hooksPath, constants.W_OK);
        return true;
      };

      // Assert: Directory exists and can accept new files
      expect(exists).toBe(true);
      expect(isWritable()).toBe(true);
    });
  });
});
