import { describe, expect, it } from 'vitest';
import { parseFeaturedDay } from '../lib/wiki';

const day = {
  tfa: {
    titles: { normalized: 'French battleship Brennus' },
    extract: 'Brennus was the first pre-dreadnought battleship built for the Marine Nationale.',
    thumbnail: { source: 'https://upload.wikimedia.org/brennus.jpg', width: 960, height: 639 },
    content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/French_battleship_Brennus' } },
  },
  image: {
    thumbnail: { source: 'https://upload.wikimedia.org/berry.jpg', width: 640, height: 531 },
    file_page: 'https://commons.wikimedia.org/wiki/File:Berry.jpg',
    artist: { text: 'Laitche' },
    license: { type: 'CC BY-SA 4.0' },
    description: { text: 'Purple beautyberry, Daisen Park, Sakai, Osaka. Focus stack of 4 photos.' },
  },
};

describe('parseFeaturedDay', () => {
  it('maps the featured article and picture of the day', () => {
    const [tfa, potd] = parseFeaturedDay(day, '2026-10-17');
    expect(tfa).toMatchObject({
      kind: 'wiki',
      id: 'wiki-tfa-2026-10-17',
      label: 'Featured article',
      title: 'French battleship Brennus',
      source: { url: 'https://en.wikipedia.org/wiki/French_battleship_Brennus' },
      image: { width: 960, height: 639 },
    });
    expect(potd).toMatchObject({
      id: 'wiki-potd-2026-10-17',
      label: 'Picture of the day',
      title: 'Purple beautyberry, Daisen Park, Sakai, Osaka',
      image: { credit: 'Laitche · CC BY-SA 4.0' },
    });
  });

  it('skips parts that are missing', () => {
    expect(parseFeaturedDay({}, '2026-10-17')).toEqual([]);
    expect(parseFeaturedDay({ tfa: day.tfa }, '2026-10-17')).toHaveLength(1);
  });
});
