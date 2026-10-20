import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { editionForMode, type Edition } from './shared/editions.ts';
import { readMp4 } from './shared/video.ts';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * `virtual:clip-lengths`: every clip's length in seconds, keyed "<post-id>/<file>.mp4", read from the
 * files at build time, so the app can show "Watch · 0:54" before a clip has loaded.
 */
function clipLengths(media: string): Plugin {
  const id = 'virtual:clip-lengths';
  return {
    name: 'clip-lengths',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(resolved) {
      if (resolved !== `\0${id}`) return;
      const lengths: Record<string, number> = {};
      let posts: string[] = [];
      try {
        posts = readdirSync(media);
      } catch {
        // An edition without media yet.
      }
      for (const post of posts) {
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

/** The page's language, title and description come from the edition. */
function editionPage(edition: Edition): Plugin {
  return {
    name: 'edition-page',
    transformIndexHtml: (html) =>
      html
        .replace('<html lang="en">', `<html lang="${edition.lang}">`)
        .replace(/<title>.*<\/title>/, `<title>${edition.name}</title>`)
        .replace(/(<meta name="description" content=")[^"]*"/, `$1${edition.description}"`),
  };
}

// `vite --mode lesefutter` and `vite build --mode lesefutter` make Lesefutter; other modes make Reckon.
export default defineConfig(({ mode }) => {
  const edition = editionForMode(mode);
  const content = join(root, edition.dir, 'content');
  return {
    plugins: [react(), clipLengths(join(content, 'media')), editionPage(edition)],
    // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages).
    base: './',
    define: { __EDITION__: JSON.stringify(edition) },
    resolve: { alias: { '@content': content } },
    publicDir: join(root, edition.dir, 'public'),
    build: { outDir: join(root, 'dist', edition.path) },
    test: {
      environment: 'node',
      // The library is an import.meta.glob over content/; a cached transform would miss newly added posts.
      fsModuleCache: false,
    },
  };
});
