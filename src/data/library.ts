import type { FieldId, KnowledgeCard } from '../types';

// Every post is a JSON file in content/posts/<field>/<id>.json; images live in content/media/<id>/.
const postFiles = import.meta.glob<KnowledgeCard>('../../content/posts/*/*.json', { eager: true, import: 'default' });
const mediaFiles = import.meta.glob<string>('../../content/media/*/*', { eager: true, query: '?url', import: 'default' });

function resolveImage(postId: string, src: string): string {
  if (src.startsWith('https://')) return src;
  return mediaFiles[`../../content/media/${postId}/${src}`] ?? src;
}

function resolve(post: KnowledgeCard): KnowledgeCard {
  return {
    ...post,
    cover: post.cover && { ...post.cover, src: resolveImage(post.id, post.cover.src) },
    slides: post.slides?.map((s) => (s.type === 'image' ? { ...s, src: resolveImage(post.id, s.src) } : s)),
  };
}

export const LIBRARY: KnowledgeCard[] = Object.values(postFiles)
  .map(resolve)
  .sort((a, b) => a.id.localeCompare(b.id));

export const CARD_BY_ID: ReadonlyMap<string, KnowledgeCard> = new Map(LIBRARY.map((c) => [c.id, c]));

export function cardsInField(field: FieldId): KnowledgeCard[] {
  return LIBRARY.filter((c) => c.field === field);
}
