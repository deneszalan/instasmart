export type FieldId =
  | 'physics'
  | 'space'
  | 'biology'
  | 'chemistry'
  | 'math'
  | 'history'
  | 'psychology'
  | 'economics'
  | 'tech'
  | 'language'
  | 'philosophy'
  | 'art'
  | 'music'
  | 'earth'
  | 'body'
  | 'engineering';

export interface Field {
  id: FieldId;
  name: string;
  /** Account-style handle shown as the post author. */
  handle: string;
  emoji: string;
  /** Two gradient stops used for the post visual and story ring. */
  gradient: [string, string];
}

export interface Slide {
  heading: string;
  text: string;
}

export interface Source {
  label: string;
  url: string;
}

/** A hand-written knowledge piece from the curated library. */
export interface KnowledgeCard {
  /** Unique, stable id: `${field}-${slug}`. */
  id: string;
  field: FieldId;
  /** The hook shown big on the first slide. */
  title: string;
  /** One emoji illustrating the piece. */
  emoji: string;
  /** Caption text: the explanation. */
  body: string;
  /** Extra carousel slides shown after the title slide. */
  slides?: Slide[];
  /** Lowercase hashtags without the leading '#'. */
  tags: string[];
  source: Source;
}

export interface WikiImage {
  src: string;
  width: number;
  height: number;
  credit?: string;
}

/** A post rendered in the feed: either a curated card or a live Wikipedia piece. */
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
