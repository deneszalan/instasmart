import type { Post as PostData, Slide, Source } from '../shared/schema.ts';

export type { Field, FieldId } from '../shared/fields.ts';
export type { Slide, Source };

/** A knowledge post from content/posts/, with image paths resolved to URLs. */
export type KnowledgeCard = PostData;

export interface WikiImage {
  src: string;
  width: number;
  height: number;
  credit?: string;
}

/** A post rendered in the feed: either a library card or a live Wikipedia piece. */
export type Post =
  | { kind: 'card'; key: string; card: KnowledgeCard }
  | {
      kind: 'wiki';
      key: string;
      id: string;
      label: string;
      title: string;
      body: string;
      image?: WikiImage;
      source: Source;
      date: string;
    };
