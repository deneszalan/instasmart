import type { Post } from '../types';

export type WikiPost = Extract<Post, { kind: 'wiki' }>;

const API = 'https://en.wikipedia.org/api/rest_v1/feed/featured';

interface WikiThumb {
  source: string;
  width: number;
  height: number;
}

interface FeaturedResponse {
  tfa?: {
    titles?: { normalized?: string };
    title?: string;
    extract?: string;
    thumbnail?: WikiThumb;
    content_urls?: { desktop?: { page?: string } };
  };
  image?: {
    title?: string;
    thumbnail?: WikiThumb;
    file_page?: string;
    artist?: { text?: string };
    license?: { type?: string };
    description?: { text?: string };
  };
}

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Map one day of Wikipedia's featured feed to posts (featured article + picture of the day). */
export function parseFeaturedDay(data: FeaturedResponse, day: string): WikiPost[] {
  const posts: WikiPost[] = [];
  const { tfa, image } = data;

  if (tfa?.extract && tfa.content_urls?.desktop?.page) {
    const title = tfa.titles?.normalized ?? tfa.title?.replace(/_/g, ' ') ?? 'Featured article';
    posts.push({
      kind: 'wiki',
      key: `wiki-tfa-${day}`,
      id: `wiki-tfa-${day}`,
      label: 'Featured article',
      title,
      body: tfa.extract,
      image: tfa.thumbnail
        ? { src: tfa.thumbnail.source, width: tfa.thumbnail.width, height: tfa.thumbnail.height }
        : undefined,
      source: { label: `Wikipedia: ${title}`, url: tfa.content_urls.desktop.page },
      date: day,
    });
  }

  const description = image?.description?.text?.trim();
  if (image?.thumbnail && image.file_page && description) {
    const credit = [image.artist?.text?.trim(), image.license?.type].filter(Boolean).join(' · ');
    posts.push({
      kind: 'wiki',
      key: `wiki-potd-${day}`,
      id: `wiki-potd-${day}`,
      label: 'Picture of the day',
      title: description.split(/(?<=\.)\s/)[0].replace(/\.$/, ''),
      body: description,
      image: {
        src: image.thumbnail.source,
        width: image.thumbnail.width,
        height: image.thumbnail.height,
        credit: credit || undefined,
      },
      source: { label: 'Wikimedia Commons', url: image.file_page },
      date: day,
    });
  }

  return posts;
}

export async function fetchFeaturedDay(date: Date, signal?: AbortSignal): Promise<WikiPost[]> {
  const day = isoDay(date);
  const [y, m, d] = day.split('-');
  const res = await fetch(`${API}/${y}/${m}/${d}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia feed ${day}: HTTP ${res.status}`);
  return parseFeaturedDay((await res.json()) as FeaturedResponse, day);
}

/**
 * Walks Wikipedia's featured content backwards one day at a time, which makes
 * an effectively endless supply of curated articles and photos.
 */
export function createWikiStream(start = new Date()) {
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  let failures = 0;

  return {
    /** Fetch the next (older) day. Resolves to [] on failure; gives up after repeated failures. */
    async next(signal?: AbortSignal): Promise<WikiPost[]> {
      if (failures >= 3) return [];
      const day = cursor;
      cursor = new Date(day.getTime() - 86_400_000);
      try {
        const posts = await fetchFeaturedDay(day, signal);
        failures = 0;
        return posts;
      } catch (err) {
        if (signal?.aborted) {
          cursor = day; // retry this day next time
          return [];
        }
        failures++;
        console.warn(err);
        return [];
      }
    },
    get exhausted() {
      return failures >= 3;
    },
  };
}
