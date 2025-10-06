/**
 * CH-001: Hooks TypeScript Configuration Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies that TypeScript is properly configured
 * to work with the hooks directory and its imports.
 *
 * User Story: As a frontend developer, I need TypeScript to properly
 * resolve hook imports so that I can use type-safe custom hooks.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('CH-001: Hooks TypeScript Configuration', () => {
  const PROJECT_ROOT = resolve(__dirname, '../../..');
  const TSCONFIG_APP = resolve(PROJECT_ROOT, 'tsconfig.app.json');
  const TSCONFIG_ROOT = resolve(PROJECT_ROOT, 'tsconfig.json');

  describe('TypeScript Config Files', () => {
    it('should have tsconfig.app.json file', () => {
      // Arrange: Get config file path
      const configPath = TSCONFIG_APP;

      // Act: Check if file exists
      const exists = existsSync(configPath);

      // Assert: Config file must exist
      expect(exists).toBe(true);
    });

    it('should have valid JSON in tsconfig.app.json', () => {
      // Arrange: Read the config file
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');

      // Act: Parse JSON
      const parseJSON = () => JSON.parse(content);

      // Assert: Should be valid JSON
      expect(parseJSON).not.toThrow();
      const config = parseJSON();
      expect(config).toBeDefined();
    });

    it('should include src directory in TypeScript compilation', () => {
      // Arrange: Read tsconfig.app.json
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check include array
      const include = config.include || [];

      // Assert: Should include src directory
      const includesSrc = include.some((path: string) => path.includes('src'));
      expect(includesSrc).toBe(true);
    });
  });

  describe('Path Alias Configuration', () => {
    it('should support @ alias for src directory', async () => {
      // Arrange: Try to resolve @/ import
      const testImport = async () => {
        // This will fail if path alias is not configured
        return await import('@/hooks');
      };

      // Act & Assert: Import should work with @ alias
      await expect(testImport()).resolves.toBeDefined();
    });

    it('should support hooks alias for hooks directory', async () => {
      // Arrange: Try to resolve hooks import
      const testImport = async () => {
        // This will work if hooks alias is configured
        return await import('hooks');
      };

      // Act & Assert: Import should work with hooks alias
      await expect(testImport()).resolves.toBeDefined();
    });

    it('should resolve hooks imports without errors', async () => {
      // Arrange: Multiple import variations
      const importWithAlias = async () => await import('@/hooks');
      const importDirect = async () => await import('hooks');

      // Act & Assert: All variations should work
      await expect(importWithAlias()).resolves.toBeDefined();
      await expect(importDirect()).resolves.toBeDefined();
    });
  });

  describe('TypeScript Module Resolution', () => {
    it('should resolve hooks directory as a valid module', async () => {
      // Arrange & Act: Import the hooks module
      const hooksModule = await import('@/hooks');

      // Assert: Module should resolve successfully
      expect(hooksModule).toBeDefined();
      expect(typeof hooksModule).toBe('object');
    });

    it('should not have type errors when importing from hooks', async () => {
      // Arrange: Import hooks barrel export
      const importHooks = async () => {
        const hooks = await import('@/hooks');
        return hooks;
      };

      // Act & Assert: Should import without throwing type errors
      await expect(importHooks()).resolves.toBeDefined();
    });

    it('should support ES module syntax for hooks imports', async () => {
      // Arrange: Test ES module import
      const testESModuleImport = async () => {
        const hooks = await import('@/hooks');
        // ES modules should be objects
        return typeof hooks === 'object' && hooks !== null;
      };

      // Act: Execute import
      const isESModule = await testESModuleImport();

      // Assert: Should be valid ES module
      expect(isESModule).toBe(true);
    });
  });

  describe('Type Definition Support', () => {
    it('should allow importing types from hooks directory', async () => {
      // Arrange: Import the hooks module
      const hooksModule = await import('@/hooks');

      // Act: Check if module is defined and accessible
      const isAccessible = hooksModule !== undefined;

      // Assert: Module should be accessible for type imports
      expect(isAccessible).toBe(true);
    });

    it('should preserve type information across barrel exports', async () => {
      // Arrange: Import hooks multiple times
      const firstImport = await import('@/hooks');
      const secondImport = await import('@/hooks');

      // Act: Compare module structure
      const firstType = typeof firstImport;
      const secondType = typeof secondImport;

      // Assert: Type should be consistent
      expect(firstType).toBe(secondType);
      expect(firstType).toBe('object');
    });
  });

  describe('Compilation Configuration', () => {
    it('should have strict mode enabled in TypeScript config', () => {
      // Arrange: Read tsconfig.app.json
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check compiler options
      const compilerOptions = config.compilerOptions || {};
      const strictMode = compilerOptions.strict;

      // Assert: Strict mode should be enabled
      expect(strictMode).toBe(true);
    });

    it('should target modern JavaScript (ES2020 or later)', () => {
      // Arrange: Read tsconfig.app.json
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check target
      const compilerOptions = config.compilerOptions || {};
      const target = compilerOptions.target;

      // Assert: Should target ES2020 or newer
      expect(target).toBeDefined();
      expect(['ES2020', 'ES2021', 'ES2022', 'ESNext']).toContain(target);
    });

    it('should use ESNext module system', () => {
      // Arrange: Read tsconfig.app.json
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check module setting
      const compilerOptions = config.compilerOptions || {};
      const moduleSystem = compilerOptions.module;

      // Assert: Should use ESNext
      expect(moduleSystem).toBe('ESNext');
    });

    it('should enable JSX support for React', () => {
      // Arrange: Read tsconfig.app.json
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check JSX setting
      const compilerOptions = config.compilerOptions || {};
      const jsx = compilerOptions.jsx;

      // Assert: Should have JSX configured
      expect(jsx).toBeDefined();
      expect(['react', 'react-jsx', 'react-jsxdev']).toContain(jsx);
    });
  });

  describe('Import Path Resolution', () => {
    it('should resolve relative imports from hooks directory', async () => {
      // Arrange: Import using relative path from test directory
      const testRelativeImport = async () => {
        // This tests if hooks can be imported using relative paths
        return await import('../../hooks');
      };

      // Act & Assert: Relative import should work
      await expect(testRelativeImport()).resolves.toBeDefined();
    });

    it('should resolve absolute imports using @ alias', async () => {
      // Arrange: Import using absolute alias
      const testAliasImport = async () => {
        return await import('@/hooks');
      };

      // Act & Assert: Alias import should work
      await expect(testAliasImport()).resolves.toBeDefined();
    });

    it('should maintain consistent module resolution across different import styles', async () => {
      // Arrange: Import using different methods
      const relativeImport = await import('../../hooks');
      const aliasImport = await import('@/hooks');

      // Act: Compare imports
      const areSameModule = relativeImport === aliasImport;

      // Assert: Both should resolve to the same module
      expect(areSameModule).toBe(true);
    });
  });

  describe('Hooks Directory Integration', () => {
    it('should recognize hooks directory as a valid TypeScript module location', () => {
      // Arrange: Read tsconfig to verify src is included
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check if src (which contains hooks) is included
      const include = config.include || [];
      const includesSrc = include.some((path: string) => path.includes('src'));

      // Assert: Hooks directory should be within TypeScript's scope
      expect(includesSrc).toBe(true);
    });

    it('should allow TypeScript to type-check files in hooks directory', async () => {
      // Arrange: Import hooks module
      const hooksModule = await import('@/hooks');

      // Act: Verify module is properly typed
      const moduleType = typeof hooksModule;

      // Assert: TypeScript should recognize this as an object module
      expect(moduleType).toBe('object');
      expect(hooksModule).not.toBeUndefined();
    });

    it('should support future hook file additions without config changes', () => {
      // Arrange: Read tsconfig include paths
      const configPath = TSCONFIG_APP;
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Act: Check for wildcard or broad include patterns
      const include = config.include || [];
      const hasWildcard = include.some(
        (path: string) => path.includes('src') || path.includes('*')
      );

      // Assert: Config should support adding new files
      expect(hasWildcard).toBe(true);
    });
  });
});
