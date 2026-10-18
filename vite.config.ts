import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages).
  base: './',
  test: {
    environment: 'node',
    // The library is an import.meta.glob over content/; a cached transform would miss newly added posts.
    fsModuleCache: false,
  },
});
