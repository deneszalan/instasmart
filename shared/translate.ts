// A post in another language is its English post with the text swapped: a translation file holds only
// the strings to replace, in the post's own shape, so numbers, answers, media and order stay the post's.
import type { Post } from './schema.ts';

/** The languages an app can be read in. */
export type Lang = 'en' | 'de';

export const TRANSLATIONS_DIR = 'content/i18n';

/** Where a post's translation lives: content/i18n/<lang>/<field>/<id>.json. */
export function translationPath(lang: string, post: Pick<Post, 'field' | 'id'>): string {
  return `${TRANSLATIONS_DIR}/${lang}/${post.field}/${post.id}.json`;
}

/** Strings a translation may not change: names of things rather than text a reader reads. */
const FIXED = new Set(['id', 'field', 'type', 'lab', 'poster', 'emoji', 'icon', 'format', 'fit', 'href', 'url', 'createdAt', 'author', 'theme', 'captionAt', 'kind', 'timing', 'style', 'colors', 'src']);

export interface Translated {
  post: Post;
  problems: string[];
}

/**
 * The post with a translation's strings in place of its own. A translation may only replace strings that
 * the post has (arrays must keep their length), plus `src` on a video slide, for a clip narrated in the
 * translation's language. Anything else is reported, and the post's own value is kept.
 */
export function applyTranslation(post: Post, translation: unknown): Translated {
  const problems: string[] = [];
  const merge = (base: unknown, over: unknown, path: string, key: string, inVideo: boolean): unknown => {
    if (over === undefined) return base;
    if (base === undefined) {
      problems.push(`${path}: the post has nothing here to translate`);
      return base;
    }
    if (typeof base === 'string') {
      if (typeof over !== 'string') problems.push(`${path}: must be text, like the post's`);
      else if (FIXED.has(key) && !(key === 'src' && inVideo) && over !== base) problems.push(`${path}: "${key}" can't be translated; leave it out`);
      else return over;
      return base;
    }
    if (Array.isArray(base)) {
      if (!Array.isArray(over) || over.length !== base.length) {
        problems.push(`${path}: must be a list of ${base.length}, like the post's`);
        return base;
      }
      return base.map((b, i) => merge(b, over[i], `${path}[${i}]`, key, inVideo));
    }
    if (base && typeof base === 'object') {
      if (!over || typeof over !== 'object' || Array.isArray(over)) {
        problems.push(`${path}: must be an object, like the post's`);
        return base;
      }
      const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
      const video = (base as { type?: unknown }).type === 'video';
      for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
        if (FIXED.has(k) && !(k === 'src' && video) && v !== (base as Record<string, unknown>)[k]) {
          if (k in (base as object)) problems.push(`${path ? `${path}.` : ''}${k}: "${k}" can't be translated; leave it out`);
          else problems.push(`${path ? `${path}.` : ''}${k}: the post has nothing here to translate`);
          continue;
        }
        out[k] = merge((base as Record<string, unknown>)[k], v, path ? `${path}.${k}` : k, k, video);
      }
      return out;
    }
    if (over !== base) problems.push(`${path}: numbers and switches stay the post's; leave it out`);
    return base;
  };
  if (!translation || typeof translation !== 'object' || Array.isArray(translation)) return { post, problems: ['a translation must be an object'] };
  const { id, ...rest } = translation as Record<string, unknown>;
  if (id !== post.id) problems.push(`"id" must be "${post.id}", the post it translates`);
  return { post: merge(post, rest, '', '', false) as Post, problems };
}
