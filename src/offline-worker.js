// The offline worker of an edition that can be used without internet (`offline` in shared/editions.ts). The build
// (offlineWorker in vite.config.ts) writes it out as sw.js with the list of the app's own files filled in.
// It keeps the app itself, the page, scripts and styles, so it opens without internet, and serves the pictures and clips
// the reader saved under "Use without internet" from their own cache, including the byte ranges a video player asks for.
const VERSION = '__VERSION__';
/** The apps share the site, and so the browser's caches: each names its own after itself. */
const ID = '__ID__';
const SHELL = __SHELL__;
/** Other apps under this one's address (Reckon is at the site's root; Roma and Lesefutter below it): theirs to serve. */
const NESTED = __NESTED__;
const APP = `${ID}:app-${VERSION}`;
const FONTS = 'fonts';
// The saved media are in the "<id>:media" cache, which the page fills (src/lib/offline.ts) and new versions keep.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      // Older versions of this app's files, and the unnamed ones of the first offline version.
      .then((keys) => Promise.all(keys.filter((key) => (key.startsWith(`${ID}:app-`) && key !== APP) || key.startsWith('app-')).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** The bytes a "Range: bytes=start-end" header asks for in a file of `size` bytes, or null when it can't be served. */
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  const start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  const end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  return start <= end ? { start, end } : null;
}

/** Part of a saved file, as a video player asks for it. */
async function partial(response, header) {
  const blob = await response.blob();
  const range = parseRange(header, blob.size);
  if (!range) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  const body = blob.slice(range.start, range.end + 1);
  return new Response(body, {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${range.start}-${range.end}/${blob.size}`,
      'Content-Length': String(body.size),
      'Accept-Ranges': 'bytes',
    },
  });
}

/** The newest page from the network; the saved one when there is no connection or it takes too long. */
async function page(request) {
  const saved = () => caches.match(new URL('./', self.registration.scope).href, { cacheName: APP });
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 4000)),
    ]);
    return response;
  } catch (error) {
    return (await saved()) || Promise.reject(error);
  }
}

/** The app's files and saved media come from the cache; anything else from the network. */
async function file(request) {
  const cached = await caches.match(request.url, { ignoreVary: true });
  if (!cached) return fetch(request);
  const range = request.headers.get('range');
  return range ? partial(cached, range) : cached;
}

/** The logo's web font, kept once it has loaded, so the name looks right offline too. */
async function font(request) {
  const cache = await caches.open(FONTS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') event.respondWith(font(request));
  else if (url.origin !== self.location.origin) return;
  else if (NESTED.some((path) => request.url.startsWith(new URL(path, self.registration.scope).href))) return;
  else if (request.mode === 'navigate') event.respondWith(page(request));
  else event.respondWith(file(request));
});
