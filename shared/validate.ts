import { FIELD_IDS } from './fields.ts';
import { formatIssues, localMedia, MEDIA_EXTENSIONS, Post, VIDEO_EXTENSIONS } from './schema.ts';
import { MAX_FOOTAGE_BYTES, MAX_FOOTAGE_SECONDS, readMp4, STEP_STILL_BEFORE_END, stepStill, videoProblems } from './video.ts';

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

const ALLOWED_EXTENSIONS: readonly string[] = [...MEDIA_EXTENSIONS, ...VIDEO_EXTENSIONS];

/** Check one media file: allowed type, matching content, size limits, SVG safety and playable video. */
export function mediaProblems(name: string, bytes: Uint8Array): string[] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return [`unsupported file type ".${ext}" (allowed: ${ALLOWED_EXTENSIONS.join(', ')})`];
  }
  if (name !== name.toLowerCase() || !/^[a-z0-9][a-z0-9_-]*\.[a-z0-9]+$/.test(name)) {
    return ['file names must be lowercase letters, digits, "-" or "_", e.g. "orbit-diagram.svg"'];
  }
  if (ext === 'mp4') return videoProblems(bytes);
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

/** A step may start up to this long after a keyframe: decoding that far is quick. */
const START_KEYFRAME_SLACK = 1;
/** A step's still may come up to this long after a keyframe: three frames at 30 fps. */
const STILL_KEYFRAME_SLACK = 0.1;
/** Most seconds between keyframes in a clip with steps. */
const MAX_KEYFRAME_GAP = 4;

/** "the step at 4.5 s" or "3 steps (0.4 s, 4.5 s, 8.2 s, …)" */
const stepList = (steps: { start: number }[]) =>
  steps.length === 1
    ? `the step at ${steps[0].start} s`
    : `${steps.length} steps (${steps.slice(0, 3).map((step) => `${step.start} s`).join(', ')}${steps.length > 3 ? ', …' : ''})`;

/** Checks that need the clip itself: its soundtrack against the music credit, the steps against its length and keyframes. */
function clipProblems(post: Post, mediaBytes: Map<string, Uint8Array>): string[] {
  const problems: string[] = [];
  (post.slides ?? []).forEach((slide, i) => {
    if (slide.type !== 'video') return;
    const steps = slide.steps ?? [];
    steps.forEach((step, j) => {
      if (step.end <= step.start) problems.push(`slides[${i}].steps[${j}]: "end" must be after "start"`);
      if (j > 0 && step.start < steps[j - 1].start) problems.push(`slides[${i}].steps[${j}]: steps must be in order of "start"`);
    });
    const bytes = mediaBytes.get(mediaPath(post.id, slide.src));
    if (!bytes) return;
    let info: ReturnType<typeof readMp4>;
    try {
      info = readMp4(bytes);
    } catch {
      return; // The file's own problems are reported with the file.
    }
    if (!slide.animation) {
      if (info.durationSeconds > MAX_FOOTAGE_SECONDS) {
        problems.push(`slides[${i}]: "${slide.src}" is ${info.durationSeconds.toFixed(1)} s long; footage is at most ${MAX_FOOTAGE_SECONDS} s (only animations, which hold steps for reading, may run longer)`);
      }
      if (bytes.length > MAX_FOOTAGE_BYTES) {
        problems.push(`slides[${i}]: "${slide.src}" is ${bytes.length} bytes; footage is at most ${MAX_FOOTAGE_BYTES}. Make it shorter, narrower (480 px is plenty) or more compressed`);
      }
    }
    const hasAudio = info.audioCodec !== null;
    if (hasAudio && !slide.music) problems.push(`slides[${i}]: "${slide.src}" has a soundtrack, so credit it in "music" (or remove the audio)`);
    if (!hasAudio && slide.music) problems.push(`slides[${i}]: "music" is credited but "${slide.src}" has no audio track`);
    const last = steps.at(-1);
    if (last && last.end > info.durationSeconds + 0.1) {
      problems.push(`slides[${i}]: the last step ends at ${last.end} s, after the ${info.durationSeconds.toFixed(1)} s clip`);
    }
    // Readers jump between steps and drag through explainers, and a player can only start decoding at a
    // keyframe. Playing, a jump lands on a step's start; paused, on its still.
    if (steps.length && info.keyframes.length) {
      const near = (t: number, slack: number) => info.keyframes.some((k) => k <= t + 0.01 && k >= t - slack);
      const slowStart = steps.filter((step) => !near(step.start, START_KEYFRAME_SLACK));
      if (slowStart.length) {
        problems.push(`slides[${i}]: no keyframe within ${START_KEYFRAME_SLACK} s before ${stepList(slowStart)} ${slowStart.length === 1 ? 'starts' : 'start'}, so jumping there is slow. \`npm run explainer\` encodes the keyframes; with ffmpeg, use \`-force_key_frames <times>\``);
      }
      const slowStill = steps.filter((step) => !near(stepStill(step), STILL_KEYFRAME_SLACK));
      if (slowStill.length) {
        problems.push(`slides[${i}]: no keyframe ${STEP_STILL_BEFORE_END} s before ${stepList(slowStill)} ${slowStill.length === 1 ? 'ends, where a paused clip shows it' : 'end, where a paused clip shows them'}, so stepping while paused is slow. \`npm run explainer\` encodes the keyframes; with ffmpeg, use \`-force_key_frames <times>\``);
      }
      const gap = Math.max(...info.keyframes.concat(info.durationSeconds).map((k, j, all) => (j ? k - all[j - 1] : k)));
      if (gap > MAX_KEYFRAME_GAP + 0.05) {
        problems.push(`slides[${i}]: keyframes are up to ${gap.toFixed(1)} s apart, so the picture lags behind the seek bar; keep them at most ${MAX_KEYFRAME_GAP} s apart (\`npm run explainer\` does)`);
      }
    }
  });
  return problems;
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
  const mediaBytes = new Map<string, Uint8Array>();

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
      mediaBytes.set(file.path, file.bytes);
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
        problems.push({ file: file.path, message: `file "${name}" is missing: add it at ${mediaPath(post.id, name)}` });
      }
    }
    for (const message of clipProblems(post, mediaBytes)) problems.push({ file: file.path, message });
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
      if (!used.has(name)) problems.push({ file: mediaPath(postId, name), message: 'this file is not used by its post; remove it or reference it' });
    }
  }

  return { posts, problems };
}
