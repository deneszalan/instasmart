// Node-only helpers for reading content from a checkout. Not imported by the app.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { existsSync } from 'node:fs';
import { EDITIONS, EDITION_IDS, type Edition, type EditionId } from '../shared/editions.ts';
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

/** Every file under content/posts, content/media and content/i18n, with repo-relative POSIX paths. */
export function readContentFiles(root: string): ContentFile[] {
  const paths: string[] = [];
  walk(join(root, 'content', 'posts'), paths);
  walk(join(root, 'content', 'media'), paths);
  walk(join(root, 'content', 'i18n'), paths);
  return paths.sort().map((full) => ({
    path: relative(root, full).split(sep).join('/'),
    bytes: readFileSync(full),
  }));
}

/**
 * Where a post lives: the edition whose content/ holds its file (or, for a post not written yet,
 * the edition asked for, Reckon by default), with the absolute paths of its file and media folder.
 */
export function postHome(root: string, id: string, edition?: string): { edition: Edition; file: string; media: string } {
  if (edition !== undefined && !(edition in EDITIONS)) throw new Error(`--edition must be one of ${EDITION_IDS.join(', ')}`);
  const at = (e: Edition) => ({
    edition: e,
    file: join(root, e.dir, 'content', 'posts', id.split('-')[0], `${id}.json`),
    media: join(root, e.dir, 'content', 'media', id),
  });
  const found = EDITION_IDS.map((e) => at(EDITIONS[e])).find((home) => existsSync(home.file));
  return found ?? at(EDITIONS[(edition ?? 'reckon') as EditionId]);
}
