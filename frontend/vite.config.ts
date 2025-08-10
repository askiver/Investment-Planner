// vite.config.ts (or vite.config.mjs)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/Investment-Planner/', // keep if deploying to GitHub Pages project page
});
