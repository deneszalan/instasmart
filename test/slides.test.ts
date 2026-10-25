import { describe, expect, it } from 'vitest';
import type { KnowledgeCard, Slide } from '../src/types';
import { slideText } from '../src/lib/feed';
import { firstInteractive, isPuzzle, pickInteractive } from '../src/lib/interactive';
import { firstAnimation, firstFootage, firstVisual } from '../src/lib/visual';

const card = (slides: Slide[]): KnowledgeCard => ({
  id: 'space-test',
  field: 'space',
  title: 'A test post',
  emoji: '🪐',
  body: 'A body long enough to pass the schema, which asks for at least eighty characters of text.',
  tags: ['test'],
  source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Space' },
  slides,
});

describe('visual and puzzle slides', () => {
  it('put their words into the search text', () => {
    expect(slideText({ type: 'chart', heading: 'Moons', unit: 'moons', items: [{ label: 'Mars', value: 2 }, { label: 'Earth', value: 1 }] })).toBe(
      'Moons Mars 2 moons, Earth 1 moons',
    );
    expect(slideText({ type: 'pictogram', heading: 'Water', icon: '🟦', total: 100, count: 71, note: 'NOAA' })).toBe('Water 71 of 100 NOAA');
    expect(slideText({ type: 'spectrum', heading: 'Loud', min: 0, max: 140, unit: 'dB', marks: [{ label: 'Whisper', value: 30 }] })).toBe('Loud Whisper 30 dB');
    expect(slideText({ type: 'flow', heading: 'Cycle', steps: [{ label: 'Rain' }, { label: 'River' }, { label: 'Sea' }] })).toBe('Cycle Rain → River → Sea');
    expect(slideText({ type: 'match', heading: 'Pairs', pairs: [{ left: 'Curie', right: 'Radium' }] })).toBe('Pairs Curie: Radium');
    expect(slideText({ type: 'sort', heading: 'Fact or myth?', bins: ['Fact', 'Myth'], items: [{ text: 'Honey keeps', bin: 0 }] })).toBe(
      'Fact or myth? Honey keeps (Fact)',
    );
    expect(slideText({ type: 'scramble', clue: 'Plants do it', answer: 'photosynthesis' })).toBe('Plants do it photosynthesis');
    expect(slideText({ type: 'odd', items: ['Mercury', 'Jupiter'], answer: 1, explanation: 'Gas giant.' })).toBe('Mercury / Jupiter Gas giant.');    expect(slideText({ type: 'rank', heading: 'Moons', unit: 'moons', items: [{ label: 'Mars', value: 2 }], explanation: 'Few.' })).toBe('Moons Mars 2 moons Few.');
    expect(slideText({ type: 'fill', question: 'How many?', icon: '🧍', total: 10, answer: 3, explanation: 'Three.' })).toBe('How many? 3 of 10 Three.');
    expect(slideText({ type: 'place', question: 'How loud?', min: 0, max: 140, answer: 110, unit: 'dB', explanation: 'Loud.' })).toBe('How loud? 110 dB Loud.');
  });

  it('can be picked for a story by a key', () => {
    const c = card([
      { type: 'text', text: 'Hello' },
      { type: 'quiz', question: 'q', options: ['a', 'b'], answer: 0, explanation: 'e' },
      { type: 'scramble', clue: 'c', answer: 'word' },
    ]);
    const picks = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => pickInteractive(c, day)));
    expect([...picks].every((i) => i === 1 || i === 2)).toBe(true);
    expect(picks.size).toBe(2);
    expect(pickInteractive(c, 'mon')).toBe(pickInteractive(c, 'mon'));
    expect(pickInteractive(card([{ type: 'text', text: 'Hello' }]), 'mon')).toBe(-1);
  });

  it('count as visual or interactive', () => {
    const c = card([
      { type: 'text', text: 'Hello' },
      { type: 'chart', heading: 'h', items: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] },
      { type: 'match', heading: 'm', pairs: [{ left: 'a', right: '1' }, { left: 'b', right: '2' }, { left: 'c', right: '3' }] },
    ]);
    expect(firstVisual(c)).toBe(1);
    expect(firstInteractive(c)).toBe(2);
    expect(isPuzzle(c.slides![2])).toBe(true);
    expect(isPuzzle({ type: 'quiz', question: 'q', options: ['a', 'b'], answer: 0, explanation: 'e' })).toBe(false);
    const fill: Slide = { type: 'fill', question: 'q', icon: '🧍', total: 10, answer: 3, explanation: 'e' };
    expect(isPuzzle(fill)).toBe(true);
    expect(firstVisual(card([fill]))).toBe(0);
    expect(firstInteractive(card([fill]))).toBe(0);
  });
});

describe('video slides', () => {
  const clip = { type: 'video', src: 'a.mp4', poster: 'a.jpg', alt: 'A clip.', credit: 'NASA · Public domain · excerpt', ratings: { complexity: 2, shock: 4 } } as const;
  const animation = { ...clip, src: 'b.mp4', poster: 'b.jpg', animation: true, credit: 'Reckon · original animation' } as const;

  it('tell footage from animated explainers', () => {
    expect(firstFootage(card([clip]))).toBe(0);
    expect(firstAnimation(card([clip]))).toBe(-1);
    expect(firstFootage(card([{ type: 'text', text: 'Plain.' }, animation]))).toBe(-1);
    expect(firstAnimation(card([{ type: 'text', text: 'Plain.' }, animation]))).toBe(1);
  });
});
