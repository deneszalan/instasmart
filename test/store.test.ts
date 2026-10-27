import { describe, expect, it } from 'vitest';
import { initialState, localDay, reducer, streak } from '../src/state/store';
import type { WikiPost } from '../src/lib/wiki';

const wiki: WikiPost = {
  kind: 'wiki',
  key: 'wiki-tfa-2026-10-17',
  id: 'wiki-tfa-2026-10-17',
  label: 'Featured article',
  title: 'Brennus',
  body: 'A battleship.',
  source: { label: 'Wikipedia: Brennus', url: 'https://en.wikipedia.org/wiki/Brennus' },
  date: '2026-10-17',
};

describe('reducer', () => {
  it('toggles likes, and a forced like never unlikes', () => {
    let s = reducer(initialState, { type: 'like', id: 'a' });
    expect('a' in s.liked).toBe(true);
    expect(reducer(s, { type: 'like', id: 'a', on: true })).toBe(s);
    s = reducer(s, { type: 'like', id: 'a' });
    expect('a' in s.liked).toBe(false);
  });

  it('keeps a snapshot of saved Wikipedia posts', () => {
    const s = reducer(initialState, { type: 'save', post: wiki });
    expect(s.saved[wiki.id].wiki).toEqual(wiki);
    expect(reducer(s, { type: 'save', post: wiki }).saved).toEqual({});
  });

  it('records reads and the day they happened', () => {
    const s = reducer(initialState, { type: 'seen', id: 'a' });
    expect(Object.keys(s.seen)).toEqual(['a']);
    expect(s.activeDays).toEqual([localDay()]);
    expect(reducer(s, { type: 'seen', id: 'a' })).toBe(s);
  });

  it('reset keeps settings', () => {
    const s = reducer({ ...initialState, settings: { wiki: false, theme: 'dark', speed: 1.5, stepMode: true, sort: 'newest' }, liked: { a: 1 } }, { type: 'reset' });
    expect(s.liked).toEqual({});
    expect(s.settings).toEqual({ wiki: false, theme: 'dark', speed: 1.5, stepMode: true, sort: 'newest' });
  });
});

describe('streak', () => {
  const today = new Date(2026, 9, 18);
  it('counts consecutive days ending today', () => {
    expect(streak(['2026-10-16', '2026-10-17', '2026-10-18'], today)).toBe(3);
  });
  it('still counts when today has no reading yet', () => {
    expect(streak(['2026-10-16', '2026-10-17'], today)).toBe(2);
  });
  it('breaks on a gap', () => {
    expect(streak(['2026-10-14', '2026-10-16'], today)).toBe(0);
    expect(streak(['2026-10-14', '2026-10-17', '2026-10-18'], today)).toBe(2);
  });
});
