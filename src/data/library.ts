import clipLengths from 'virtual:clip-lengths';
import mediaSizes from 'virtual:media-sizes';
import { applyTranslation } from '../../shared/translate.ts';
import type { Post } from '../../shared/schema.ts';
import { LANG } from '../i18n';
import { OFFLINE_ONLY, SAVED_IDS } from './offline-set';
import type { FieldId, KnowledgeCard } from '../types';

// Every post is a JSON file in content/posts/<field>/<id>.json; images and clips live in content/media/<id>/.
// @content is this edition's content/ folder (see vite.config.ts).
const postFiles = import.meta.glob<KnowledgeCard>('@content/posts/*/*.json', { eager: true, import: 'default' });
const mediaFiles = import.meta.glob<string>('@content/media/*/*', { eager: true, query: '?url', import: 'default' });
// A post's translations are in content/i18n/<lang>/<field>/<id>.json; one in the reader's language replaces its text.
const translationFiles = import.meta.glob<unknown>('@content/i18n/*/*/*.json', { eager: true, import: 'default' });
const translations = new Map(
  Object.entries(translationFiles)
    .filter(([path]) => path.split('/').at(-3) === LANG)
    .map(([path, data]) => [path.split('/').at(-1)!.replace(/\.json$/, ''), data]),
);

function translate(post: KnowledgeCard): KnowledgeCard {
  const translation = translations.get(post.id);
  return translation ? (applyTranslation(post as Post, translation).post as KnowledgeCard) : post;
}

/** Media URLs by "<post-id>/<file>". */
const mediaUrls = new Map(Object.entries(mediaFiles).map(([path, url]) => [path.split('/').slice(-2).join('/'), url]));

/** Every picture and clip of this version of the app, in every language. */
export const MEDIA_URLS: readonly string[] = [...mediaUrls.values()];

function resolveImage(postId: string, src: string): string {
  if (src.startsWith('https://')) return src;
  return mediaUrls.get(`${postId}/${src}`) ?? src;
}

function resolve(post: KnowledgeCard): KnowledgeCard {
  return {
    ...post,
    cover: post.cover && { ...post.cover, src: resolveImage(post.id, post.cover.src) },
    slides: post.slides?.map((s) =>
      s.type === 'image' || s.type === 'comic'
        ? { ...s, src: resolveImage(post.id, s.src) }
        : s.type === 'video'
          ? { ...s, src: resolveImage(post.id, s.src), poster: resolveImage(post.id, s.poster) }
          : s,
    ),
  };
}

/** Every post of this app, in the reader's language. */
export const ALL_CARDS: KnowledgeCard[] = Object.values(postFiles)
  .map(translate)
  .map(resolve)
  .sort((a, b) => a.id.localeCompare(b.id));

/** The posts the app shows: all of them, or in offline mode only the ones saved on this device. */
export const LIBRARY: KnowledgeCard[] = OFFLINE_ONLY ? ALL_CARDS.filter((c) => SAVED_IDS.has(c.id)) : ALL_CARDS;

// Clip lengths by the clip's URL, which is what slides carry once resolved.
const lengthByUrl = new Map(Object.entries(clipLengths).map(([path, seconds]) => [resolveImage(path.split('/')[0], path.split('/')[1]), seconds]));

/** A clip's length in seconds, known before it loads, or undefined. */
export function clipSeconds(src: string): number | undefined {
  return lengthByUrl.get(src);
}

const bytesByUrl = new Map(Object.entries(mediaSizes).map(([path, bytes]) => [resolveImage(path.split('/')[0], path.split('/')[1]), bytes]));

/** A picture's or clip's size in bytes, by the URL slides carry, or undefined. */
export function mediaBytes(src: string): number | undefined {
  return bytesByUrl.get(src);
}

export const CARD_BY_ID: ReadonlyMap<string, KnowledgeCard> = new Map(LIBRARY.map((c) => [c.id, c]));

export function cardsInField(field: FieldId): KnowledgeCard[] {
  return LIBRARY.filter((c) => c.field === field);
}
