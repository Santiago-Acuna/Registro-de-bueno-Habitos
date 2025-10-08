import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for lightweight DOM implementation
    environment: "happy-dom",

    // Enable globals for Jest-like API (describe, it, expect, etc.)
    globals: true,

    // Setup files to run before each test file
    setupFiles: ["./src/test/setup.ts"],

    // Include source files for coverage
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "src/main.tsx",
      ],
    },

    // Test timeout
    testTimeout: 10000,

    // Reporter configuration
    reporters: ["verbose"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      hooks: path.resolve(__dirname, "./src/hooks"),
    },
  },
});
