import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}', 'tests/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',                 // using @vitest/coverage-v8
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/__tests__/**'],
      thresholds: {                   // ✅ put them here
        lines: 90,
        branches: 80,
        functions: 90,
        statements: 90,
      },
    },
  },
});
