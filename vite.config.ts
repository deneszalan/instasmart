import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readMp4 } from './shared/video.ts';

/**
 * `virtual:clip-lengths`: every clip's length in seconds, keyed "<post-id>/<file>.mp4", read from the
 * files at build time, so the app can show "Watch · 0:54" before a clip has loaded.
 */
function clipLengths(): Plugin {
  const id = 'virtual:clip-lengths';
  const media = join(dirname(fileURLToPath(import.meta.url)), 'content', 'media');
  return {
    name: 'clip-lengths',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(resolved) {
      if (resolved !== `\0${id}`) return;
      const lengths: Record<string, number> = {};
      for (const post of readdirSync(media)) {
        for (const file of readdirSync(join(media, post)).filter((f) => f.endsWith('.mp4'))) {
          const path = join(media, post, file);
          this.addWatchFile(path);
          try {
            lengths[`${post}/${file}`] = Math.round(readMp4(readFileSync(path)).durationSeconds * 10) / 10;
          } catch {
            // `npm run content` reports broken clips; the app just shows no length.
          }
        }
      }
      return `export default ${JSON.stringify(lengths)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), clipLengths()],
  // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages).
  base: './',
  test: {
    environment: 'node',
    // The library is an import.meta.glob over content/; a cached transform would miss newly added posts.
    fsModuleCache: false,
  },
});
