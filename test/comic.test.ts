import { describe, expect, it } from 'vitest';
import { formatIssues, localMedia, Post } from '../shared/schema.ts';
import { bubbleBox, bubbleLines, captionBox, COMIC, COVERED, overlaps } from '../shared/comic.ts';
import type { KnowledgeCard, Slide } from '../src/types';
import { slideText } from '../src/lib/feed';
import { comicPanels, firstComic, isVisual } from '../src/lib/visual';

const post = (slides: object[]) => ({
  id: 'history-test-comic',
  field: 'history',
  title: 'A test comic about a pump',
  emoji: '🚰',
  body: 'A body that is long enough to pass validation, explaining why the thing is the way it is.',
  tags: ['test'],
  source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1854_Broad_Street_cholera_outbreak' },
  slides,
});

const panel = (extra: object = {}) => ({ type: 'comic', src: 'panel-1.jpg', alt: 'A street pump.', ...extra });

/** The problems the schema reports for one comic panel. */
function problems(extra: object): string[] {
  const result = Post.safeParse(post([panel(extra)]));
  return result.success ? [] : formatIssues(result.error);
}

describe('comic panels', () => {
  it('accept a caption and bubbles that fit', () => {
    expect(
      problems({
        caption: 'Soho, London, 1854.',
        bubbles: [
          { text: 'Where did the family get its water?', speaker: 'John Snow', x: 30, y: 40, tail: { x: 30, y: 60 } },
          { text: 'From the pump, sir.', x: 72, y: 70, width: 36, kind: 'thought' },
        ],
      }),
    ).toEqual([]);
  });

  it('reject bubbles that overlap, run off the panel or sit under the counter', () => {
    expect(problems({ bubbles: [{ text: 'One', x: 40, y: 50 }, { text: 'Two', x: 50, y: 52 }] })).toEqual(['slides[0].bubbles[1]: overlaps bubble 1']);
    expect(problems({ bubbles: [{ text: 'Off the edge', x: 10, y: 50 }] })[0]).toMatch(/runs off the panel/);
    expect(problems({ bubbles: [{ text: 'Hi', x: 80, y: 8, width: 30 }] })[0]).toMatch(/slide counter/);
    expect(problems({ bubbles: [{ text: 'Hi', x: 80, y: 94, width: 30 }] })[0]).toMatch(/Read on/);
  });

  it('reject a bubble over the caption box, wherever the caption sits', () => {
    const bubble = { text: 'Hello there', x: 30, y: 10, width: 30 };
    expect(problems({ caption: 'Soho, London, the summer of 1854.', bubbles: [bubble] })[0]).toMatch(/covers the caption box/);
    expect(problems({ caption: 'Soho, London, the summer of 1854.', captionAt: 'bottom', bubbles: [bubble] })).toEqual([]);
  });

  it('reject a bubble with too many lines for its width', () => {
    const text = 'This is far too much to say in one narrow little bubble on a phone';
    expect(bubbleLines(text, 26)).toBeGreaterThan(COMIC.maxLines);
    expect(problems({ bubbles: [{ text, x: 50, y: 50, width: 26 }] })[0]).toMatch(/more than 6 lines/);
  });

  it('estimate boxes that grow with the words', () => {
    const short = bubbleBox('Hi', 50, 50, 40), long = bubbleBox('A much longer line that has to wrap at least once', 50, 50, 40);
    expect(long.bottom - long.top).toBeGreaterThan(short.bottom - short.top);
    expect(captionBox('Soho', 'bottom').bottom).toBeLessThan(100);
    expect(overlaps(COVERED.counter, COVERED.next)).toBe(false);
  });

  it('count their art as post media', () => {
    expect(localMedia(Post.parse(post([panel(), panel({ src: 'panel-2.jpg' })])))).toEqual(['panel-1.jpg', 'panel-2.jpg']);
  });

  it('put their words into the search text and count as visual', () => {
    const slide = panel({ caption: 'Soho, 1854.', bubbles: [{ text: 'From the pump.', x: 50, y: 50 }] }) as Slide;
    expect(slideText(slide)).toBe('Soho, 1854. From the pump.');
    expect(slideText(panel() as Slide)).toBe('A street pump.');
    expect(isVisual(slide)).toBe(true);
    const card = post([{ type: 'text', text: 'Hello' }, panel(), panel()]) as KnowledgeCard;
    expect(firstComic(card)).toBe(1);
    expect(comicPanels(card)).toBe(2);
  });
});
