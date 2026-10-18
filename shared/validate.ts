import { FIELD_IDS } from './fields.ts';
import { formatIssues, localMedia, MEDIA_EXTENSIONS, Post } from './schema.ts';

/** A file in the repository, addressed by its repo-relative path. */
export interface ContentFile {
  path: string;
  bytes: Uint8Array;
}

export interface Problem {
  file: string;
  message: string;
}

export const POSTS_DIR = 'content/posts';
export const MEDIA_DIR = 'content/media';

export const MAX_IMAGE_BYTES = 1_500_000;
export const MAX_SVG_BYTES = 300_000;

export function postPath(post: Pick<Post, 'field' | 'id'>): string {
  return `${POSTS_DIR}/${post.field}/${post.id}.json`;
}

export function mediaPath(postId: string, name: string): string {
  return `${MEDIA_DIR}/${postId}/${name}`;
}

/** Pretty-printed JSON as stored in the repo (stable formatting keeps diffs small). */
export function serializePost(post: Post): string {
  const { $schema: _ignored, ...rest } = post;
  return `${JSON.stringify({ $schema: '../../schema/post.schema.json', ...rest }, null, 2)}\n`;
}

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

function sniff(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg';
  if (startsWith(bytes, ascii('GIF87a')) || startsWith(bytes, ascii('GIF89a'))) return 'gif';
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'webp';
  if (startsWith(bytes, ascii('ftypavif'), 4) || startsWith(bytes, ascii('ftypavis'), 4)) return 'avif';
  return null;
}

/**
 * SVGs are served from the app's own origin, so anything that could run code or
 * load outside resources is rejected rather than sanitised.
 */
export function svgProblems(svg: string): string[] {
  const problems: string[] = [];
  const head = svg.replace(/^﻿/, '').replace(/^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*/, '');
  if (!/^<svg[\s>]/i.test(head)) problems.push('must start with an <svg> element');
  if (!/<svg[^>]*\sviewBox\s*=/i.test(svg)) problems.push('the <svg> element needs a viewBox (e.g. viewBox="0 0 1080 1350") so it scales');
  const forbidden: [RegExp, string][] = [
    [/<script\b/i, '<script> elements'],
    [/\son[a-z]+\s*=/i, 'event handler attributes (onload=, onclick=, …)'],
    [/javascript:/i, 'javascript: URLs'],
    [/<(foreignObject|iframe|embed|object|audio|video|use)\b/i, '<foreignObject>, <iframe>, <embed>, <object>, <audio>, <video> or <use> elements'],
    [/<!(DOCTYPE|ENTITY)/i, 'DOCTYPE or ENTITY declarations'],
    [/(?:href|src)\s*=\s*["'](?!#|data:image\/(?:png|jpeg|webp|gif);base64,)/i, 'links to outside resources (only #fragment and embedded data:image/... references are allowed)'],
    [/url\(\s*["']?(?!#)/i, 'url(...) references other than #fragment'],
    [/@import/i, '@import in styles'],
  ];
  for (const [re, what] of forbidden) if (re.test(svg)) problems.push(`must not contain ${what}`);
  return problems;
}

/** Check one image file: allowed type, matching content, size limits and SVG safety. */
export function mediaProblems(name: string, bytes: Uint8Array): string[] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!(MEDIA_EXTENSIONS as readonly string[]).includes(ext)) {
    return [`unsupported file type ".${ext}" (allowed: ${MEDIA_EXTENSIONS.join(', ')})`];
  }
  if (name !== name.toLowerCase() || !/^[a-z0-9][a-z0-9_-]*\.[a-z]+$/.test(name)) {
    return ['file names must be lowercase letters, digits, "-" or "_", e.g. "orbit-diagram.svg"'];
  }
  if (ext === 'svg') {
    if (bytes.length > MAX_SVG_BYTES) return [`SVG is ${bytes.length} bytes; the limit is ${MAX_SVG_BYTES}`];
    return svgProblems(new TextDecoder().decode(bytes));
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    return [`image is ${bytes.length} bytes; the limit is ${MAX_IMAGE_BYTES}. Resize it (1080px wide is plenty) or compress it`];
  }
  const actual = sniff(bytes);
  const expected = ext === 'jpeg' ? 'jpg' : ext;
  if (actual !== expected) return [`the file content is ${actual ? actual.toUpperCase() : 'not a recognised image'}, but the name says .${ext}`];
  return [];
}

export interface ParsedPost {
  post: Post;
  path: string;
}

/** Parse and check one post file. `path` is its repo-relative path. */
export function checkPostFile(path: string, json: string): { post?: Post; problems: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (err) {
    return { problems: [`not valid JSON: ${(err as Error).message}`] };
  }
  const result = Post.safeParse(data);
  if (!result.success) return { problems: formatIssues(result.error) };

  const post = result.data;
  const expected = postPath(post);
  if (path !== expected) return { post, problems: [`a post with field "${post.field}" and id "${post.id}" must live at ${expected}`] };
  return { post, problems: [] };
}

/**
 * Validate a set of content files as a whole: every post, every image, unique ids,
 * every referenced image present and no stray media.
 */
export function validateContent(files: ContentFile[]): { posts: Post[]; problems: Problem[] } {
  const problems: Problem[] = [];
  const posts: Post[] = [];
  const media = new Map<string, Set<string>>();
  const seenIds = new Map<string, string>();

  for (const file of files) {
    if (file.path.startsWith(`${MEDIA_DIR}/`)) {
      const parts = file.path.slice(MEDIA_DIR.length + 1).split('/');
      if (parts.length !== 2) {
        problems.push({ file: file.path, message: `media must be at ${MEDIA_DIR}/<post-id>/<file>` });
        continue;
      }
      const [postId, name] = parts;
      if (!media.has(postId)) media.set(postId, new Set());
      media.get(postId)!.add(name);
      for (const message of mediaProblems(name, file.bytes)) problems.push({ file: file.path, message });
    }
  }

  for (const file of files) {
    if (!file.path.startsWith(`${POSTS_DIR}/`)) continue;
    if (!file.path.endsWith('.json')) {
      problems.push({ file: file.path, message: 'only .json post files belong in content/posts' });
      continue;
    }
    const folder = file.path.slice(POSTS_DIR.length + 1).split('/')[0];
    if (!(FIELD_IDS as readonly string[]).includes(folder)) {
      problems.push({ file: file.path, message: `"${folder}" is not a field. Folders are: ${FIELD_IDS.join(', ')}` });
      continue;
    }

    const { post, problems: own } = checkPostFile(file.path, new TextDecoder().decode(file.bytes));
    for (const message of own) problems.push({ file: file.path, message });
    if (!post) continue;

    const other = seenIds.get(post.id);
    if (other) problems.push({ file: file.path, message: `duplicate id "${post.id}" (also in ${other})` });
    seenIds.set(post.id, file.path);

    const available = media.get(post.id) ?? new Set<string>();
    for (const name of localMedia(post)) {
      if (!available.has(name)) {
        problems.push({ file: file.path, message: `image "${name}" is missing: add it at ${mediaPath(post.id, name)}` });
      }
    }
    if (own.length === 0) posts.push(post);
  }

  for (const [postId, names] of media) {
    const owner = posts.find((p) => p.id === postId);
    if (!owner && !seenIds.has(postId)) {
      problems.push({ file: `${MEDIA_DIR}/${postId}/`, message: `no post has the id "${postId}"` });
      continue;
    }
    if (!owner) continue;
    const used = new Set(localMedia(owner));
    for (const name of names) {
      if (!used.has(name)) problems.push({ file: mediaPath(postId, name), message: 'this image is not used by its post; remove it or reference it' });
    }
  }

  return { posts, problems };
}
