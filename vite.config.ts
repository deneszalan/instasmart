import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { EDITIONS, editionForMode, type Edition } from './shared/editions.ts';
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

/**
 * `virtual:media-sizes`: every media file's size in bytes, keyed "<post-id>/<file>", so an app that can be saved for
 * use without internet can say how much it will download.
 */
function mediaSizes(media: string): Plugin {
  const id = 'virtual:media-sizes';
  return {
    name: 'media-sizes',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(resolved) {
      if (resolved !== `\0${id}`) return;
      const sizes: Record<string, number> = {};
      for (const post of existsSync(media) ? readdirSync(media) : []) {
        for (const file of readdirSync(join(media, post))) sizes[`${post}/${file}`] = statSync(join(media, post, file)).size;
      }
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

/** Pictures and clips: an offline app saves these from Settings, since they are nearly all of its size. */
const MEDIA_FILE = /\.(mp4|jpe?g|png|webp|gif)$/i;

/**
 * For an edition that works without internet (`offline`): sw.js, the offline worker (src/offline-worker.js) with the
 * app's own files to keep (page, scripts, styles, fonts, icons), a web app manifest and the Home Screen tags.
 */
function offlineApp(edition: Edition, publicDir: string): Plugin {
  const icons = [192, 512].filter((size) => existsSync(join(publicDir, `icon-${size}.png`)));
  return {
    name: 'offline-app',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: (html) =>
      html.replace(
        '</head>',
        [
          '  <link rel="manifest" href="./manifest.webmanifest" />',
          existsSync(join(publicDir, 'icon-180.png')) ? '  <link rel="apple-touch-icon" href="./icon-180.png" />' : '',
          '  <meta name="apple-mobile-web-app-capable" content="yes" />',
          '  <meta name="mobile-web-app-capable" content="yes" />',
          '</head>',
        ]
          .filter(Boolean)
          .join('\n  '),
      ),
    generateBundle(_, bundle) {
      const manifest = {
        name: edition.name,
        short_name: edition.name,
        description: edition.description,
        lang: edition.lang,
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: icons.map((size) => ({ src: `icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
      };
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify(manifest, null, 2) });
      const own = existsSync(publicDir) ? readdirSync(publicDir) : [];
      const files = Object.keys(bundle).filter((f) => !MEDIA_FILE.test(f) && f !== 'index.html');
      const shell = [...new Set(['./', 'index.html', 'manifest.webmanifest', ...own, ...files])];
      const version = createHash('sha1').update(shell.join('\n')).digest('hex').slice(0, 12);
      // Apps whose path starts below this one's (all of them, for Reckon at the root).
      const nested = Object.values(EDITIONS as Record<string, Edition>)
        .filter((e) => e.id !== edition.id && (edition.path === '' ? e.path !== '' : e.path.startsWith(`${edition.path}/`)))
        .map((e) => `${edition.path === '' ? e.path : e.path.slice(edition.path.length + 1)}/`);
      const source = readFileSync(join(root, 'src/offline-worker.js'), 'utf8')
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace("'__ID__'", JSON.stringify(edition.id))
        .replace('__SHELL__', JSON.stringify(shell))
        .replace('__NESTED__', JSON.stringify(nested));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
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

// `vite --mode lesefutter` and `vite build --mode lesefutter` make Lesefutter, `--mode roma` Roma; other modes make Reckon.
export default defineConfig(({ mode }) => {
  const edition = editionForMode(mode);
  const content = join(root, edition.dir, 'content');
  const publicDir = join(root, edition.dir, 'public');
  return {
    plugins: [
      react(),
      clipLengths(join(content, 'media')),
      mediaSizes(join(content, 'media')),
      editionPage(edition),
      ...(edition.offline ? [offlineApp(edition, publicDir)] : []),
    ],
    // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages).
    base: './',
    define: { __EDITION__: JSON.stringify(edition) },
    resolve: { alias: { '@content': content } },
    publicDir,
    build: { outDir: join(root, 'dist', edition.path) },
    test: {
      environment: 'node',
      // The library is an import.meta.glob over content/; a cached transform would miss newly added posts.
      fsModuleCache: false,
    },
  };
});
