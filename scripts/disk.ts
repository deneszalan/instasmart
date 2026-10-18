// Node-only helpers for reading content from a checkout. Not imported by the app.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { ContentFile } from '../shared/validate.ts';

function walk(dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
}

/** Every file under content/posts and content/media, with repo-relative POSIX paths. */
export function readContentFiles(root: string): ContentFile[] {
  const paths: string[] = [];
  walk(join(root, 'content', 'posts'), paths);
  walk(join(root, 'content', 'media'), paths);
  return paths.sort().map((full) => ({
    path: relative(root, full).split(sep).join('/'),
    bytes: readFileSync(full),
  }));
}
