import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest configuration for the SubTract project.
 *
 * Key decisions:
 * - `environment: 'node'` — audit engine tests are pure logic, no DOM needed.
 * - `@/` alias mirrors tsconfig.json `paths` so test imports match app imports exactly.
 * - `include` targets only `.test.ts` / `.test.tsx` files inside `src/`.
 * - `coverage` uses v8 (ships with Node, zero extra deps).
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
