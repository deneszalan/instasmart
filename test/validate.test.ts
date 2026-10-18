import { describe, expect, it } from 'vitest';
import { mediaProblems, svgProblems, validateContent, type ContentFile } from '../shared/validate.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350"><circle cx="540" cy="675" r="200" fill="#fff"/></svg>';

const post = (extra: object = {}) => ({
  id: 'space-test-post',
  field: 'space',
  title: 'A test post with a decent title',
  emoji: '🪐',
  body: 'A body that is long enough to pass validation, explaining why the thing is the way it is.',
  tags: ['test'],
  source: { label: 'Wikipedia: Venus', url: 'https://en.wikipedia.org/wiki/Venus' },
  ...extra,
});

const file = (path: string, data: string | Uint8Array): ContentFile => ({
  path,
  bytes: typeof data === 'string' ? enc(data) : data,
});

describe('svgProblems', () => {
  it('accepts a plain SVG with a viewBox', () => {
    expect(svgProblems(SVG)).toEqual([]);
    expect(svgProblems(`<?xml version="1.0"?>\n<!-- diagram -->\n${SVG}`)).toEqual([]);
  });

  it.each([
    ['<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>', 'script'],
    ['<svg viewBox="0 0 1 1" onload="alert(1)"></svg>', 'event handler'],
    ['<svg viewBox="0 0 1 1"><a href="javascript:alert(1)">x</a></svg>', 'javascript:'],
    ['<svg viewBox="0 0 1 1"><image href="https://tracker.example/p.png"/></svg>', 'outside resources'],
    ['<svg viewBox="0 0 1 1"><foreignObject/></svg>', 'foreignObject'],
    ['<svg viewBox="0 0 1 1"><rect style="fill:url(https://x)"/></svg>', 'url('],
    ['<!DOCTYPE svg [<!ENTITY x "y">]><svg viewBox="0 0 1 1"/>', 'DOCTYPE'],
    ['<svg><rect/></svg>', 'viewBox'],
    ['<html><svg viewBox="0 0 1 1"/></html>', 'start with an <svg>'],
  ])('rejects %s', (svg, expected) => {
    expect(svgProblems(svg).join(' ')).toContain(expected);
  });

  it('allows internal references', () => {
    expect(svgProblems('<svg viewBox="0 0 1 1"><defs><linearGradient id="g"/></defs><rect fill="url(#g)"/><a href="#top">top</a></svg>')).toEqual([]);
  });
});

describe('mediaProblems', () => {
  it('checks the bytes match the extension', () => {
    expect(mediaProblems('a.png', PNG)).toEqual([]);
    expect(mediaProblems('a.jpg', PNG)[0]).toContain('content is PNG');
    expect(mediaProblems('a.png', enc('hello'))[0]).toContain('not a recognised image');
  });

  it('enforces names, types and sizes', () => {
    expect(mediaProblems('Photo.PNG', PNG)[0]).toContain('lowercase');
    expect(mediaProblems('a.bmp', PNG)[0]).toContain('unsupported');
    expect(mediaProblems('a.png', new Uint8Array(2_000_000))[0]).toContain('limit');
  });
});

describe('validateContent', () => {
  it('accepts a post with its image', () => {
    const files = [
      file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [{ type: 'image', src: 'orbit.svg', alt: 'An orbit' }] }))),
      file('content/media/space-test-post/orbit.svg', SVG),
    ];
    const result = validateContent(files);
    expect(result.problems).toEqual([]);
    expect(result.posts).toHaveLength(1);
  });

  it('reports wrong locations, missing and stray images, and duplicate ids', () => {
    const { problems } = validateContent([
      file('content/posts/history/space-test-post.json', JSON.stringify(post())),
      file('content/posts/space/space-test-post.json', JSON.stringify(post({ cover: { src: 'missing.jpg', alt: 'x' } }))),
      file('content/media/space-test-post/unused.png', PNG),
      file('content/media/nobody/x.png', PNG),
      file('content/posts/space/notes.txt', 'hi'),
      file('content/posts/space/broken.json', '{'),
    ]);
    const text = problems.map((p) => `${p.file}: ${p.message}`).join('\n');
    expect(text).toContain('must live at content/posts/space/space-test-post.json');
    expect(text).toContain('image "missing.jpg" is missing');
    expect(text).toContain('unused.png: this image is not used');
    expect(text).toContain('no post has the id "nobody"');
    expect(text).toContain('only .json post files');
    expect(text).toContain('not valid JSON');
  });

  it('rejects lists and timelines too tall for a phone-sized slide', () => {
    const long = 'A sentence that runs on for about eighty characters to fill two or three lines.';
    const tall = (slide: object) =>
      validateContent([file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [slide] })))]).problems.map((p) => p.message);
    expect(tall({ type: 'timeline', events: Array.from({ length: 5 }, (_, i) => ({ when: `${1900 + i}`, text: long })) })).toEqual([
      'slides[0].events: Too much text for one slide: about 20 lines, and 12 fit. Shorten the events or use fewer.',
    ]);
    expect(tall({ type: 'list', items: Array.from({ length: 6 }, () => long) })).toEqual([
      'slides[0].items: Too much text for one slide: about 18 lines, and 12 fit. Shorten the items or use fewer.',
    ]);
    expect(tall({ type: 'timeline', events: Array.from({ length: 5 }, (_, i) => ({ when: `${1900 + i}`, text: 'One short line' })) })).toEqual([]);
    expect(tall({ type: 'list', items: Array.from({ length: 6 }, () => 'A short item') })).toEqual([]);
  });

  it('checks interactive slides', () => {
    const check = (slide: object) =>
      validateContent([file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [slide] })))]).problems.map((p) => p.message);
    expect(check({ type: 'quiz', question: 'Which planet is hottest?', options: ['Mercury', 'Venus'], answer: 1, explanation: 'Venus, thanks to its thick CO₂ atmosphere.' })).toEqual([]);
    expect(check({ type: 'quiz', question: 'Which planet is hottest?', options: ['Mercury', 'Venus'], answer: 2, explanation: 'Venus.' })).toEqual([
      'slides[0].answer: answer must be between 0 and 1',
    ]);
    expect(check({ type: 'estimate', question: 'How hot is Venus?', min: 0, max: 500, step: 10, answer: 464, unit: '°C', explanation: 'About 464 °C.' })).toEqual([]);
    expect(check({ type: 'estimate', question: 'How hot is Venus?', min: 0, max: 400, answer: 464, explanation: 'About 464 °C.' })).toEqual([
      'slides[0].answer: answer must lie between min and max',
    ]);
    expect(check({ type: 'order', heading: 'Closest to the Sun first', items: ['Mercury', 'Venus', 'Earth'] })).toEqual([]);
    expect(check({ type: 'order', heading: 'Closest first', items: ['Mercury', 'Venus'] })).toEqual([
      'slides[0].items: Too small: expected array to have >=3 items',
    ]);
    expect(check({ type: 'reveal', prompt: 'Which planet spins backwards?', answer: 'Venus' })).toEqual([]);
  });

  it('checks visual slides', () => {
    const check = (slide: object) =>
      validateContent([file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [slide] })))]).problems.map((p) => p.message);
    const bars = (values: number[]) => values.map((value, i) => ({ label: `Bar ${i}`, value }));
    expect(check({ type: 'chart', heading: 'Moons', items: bars([1, 2]), unit: 'moons', note: 'Known moons' })).toEqual([]);
    expect(check({ type: 'chart', heading: 'Moons', items: bars([0, 0]) })).toEqual(['slides[0].items: at least one bar must be above 0']);
    expect(check({ type: 'chart', heading: 'Moons', items: bars([-1, 2]) })).toEqual(['slides[0].items: bar values must be 0 or more']);
    expect(check({ type: 'pictogram', heading: '1 in 4', icon: '🧍', total: 4, count: 1 })).toEqual([]);
    expect(check({ type: 'pictogram', heading: '5 in 4', icon: '🧍', total: 4, count: 5 })).toEqual(['slides[0].count: count cannot be more than total']);
    expect(check({ type: 'scale', heading: 'Earth and Jupiter', items: bars([1, 1321]) })).toEqual([]);
    expect(check({ type: 'scale', heading: 'Earth and Jupiter', items: bars([0, 1321]) })).toEqual(['slides[0].items: scale values must be above 0']);
    const marks = [{ label: 'Whisper', value: 30 }, { label: 'Jet engine', value: 140, emphasis: true }];
    expect(check({ type: 'spectrum', heading: 'Loudness', min: 0, max: 140, unit: 'dB', ends: ['Silence', 'Pain'], marks })).toEqual([]);
    expect(check({ type: 'spectrum', heading: 'Loudness', min: 0, max: 100, marks })).toEqual(['slides[0].marks: every mark must lie between min and max']);
    expect(check({ type: 'spectrum', heading: 'Loudness', min: 100, max: 100, marks })).toEqual(['slides[0].max: max must be greater than min']);
    const steps = (labels: string[]) => labels.map((label) => ({ label }));
    expect(check({ type: 'flow', heading: 'Water cycle', cycle: true, steps: steps(['Evaporation', 'Condensation', 'Rain']) })).toEqual([]);
    expect(check({ type: 'flow', heading: 'Water cycle', steps: steps(['Evaporation', 'Rain']) })).toEqual([
      'slides[0].steps: Too small: expected array to have >=3 items',
    ]);
  });

  it('checks puzzle slides', () => {
    const check = (slide: object) =>
      validateContent([file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [slide] })))]).problems.map((p) => p.message);
    const pairs = (lefts: string[]) => lefts.map((left, i) => ({ left, right: `Right ${i}` }));
    expect(check({ type: 'match', heading: 'Match them', pairs: pairs(['A', 'B', 'C']) })).toEqual([]);
    expect(check({ type: 'match', heading: 'Match them', pairs: pairs(['A', 'a', 'C']) })).toEqual(['slides[0].pairs: each side of the pairs must be unique']);
    const items = (bins: number[]) => bins.map((bin, i) => ({ text: `Claim ${i}`, bin }));
    expect(check({ type: 'sort', heading: 'Fact or myth?', bins: ['Fact', 'Myth'], items: items([0, 1, 1]) })).toEqual([]);
    expect(check({ type: 'sort', heading: 'Fact or myth?', bins: ['Fact', 'Myth'], items: items([1, 1, 1]) })).toEqual(['slides[0].items: use both bins at least once']);
    expect(check({ type: 'scramble', clue: 'What plants do with light', answer: 'photosynthesis', detail: 'Greek roots.' })).toEqual([]);
    expect(check({ type: 'scramble', clue: 'Two words', answer: 'ice cream' })).toEqual([
      'slides[0].answer: One word of 3–14 plain letters (A–Z), no spaces or accents',
    ]);
    expect(check({ type: 'odd', items: ['Mercury', 'Venus', 'Jupiter'], answer: 2, explanation: 'A gas giant among rocky planets.' })).toEqual([]);
    expect(check({ type: 'odd', items: ['Mercury', 'Venus', 'Jupiter'], answer: 3, explanation: 'A gas giant.' })).toEqual([
      'slides[0].answer: answer must be between 0 and 2',
    ]);
  });

  it('checks visual puzzles', () => {
    const check = (slide: object) =>
      validateContent([file('content/posts/space/space-test-post.json', JSON.stringify(post({ slides: [slide] })))]).problems.map((p) => p.message);
    const bars = (values: number[]) => values.map((value, i) => ({ label: `Bar ${i}`, value }));
    expect(check({ type: 'rank', heading: 'Moons', items: bars([2, 1, 95]), unit: 'moons' })).toEqual([]);
    expect(check({ type: 'rank', heading: 'Moons', items: bars([2, 2, 95]) })).toEqual(['slides[0].items: values must all differ, or there is no single right order']);
    expect(check({ type: 'higher', heading: 'Moons', items: bars([2, 1, 95]) })).toEqual([]);
    expect(check({ type: 'higher', heading: 'Moons', items: bars([2, 2, 95]) })).toEqual(['slides[0].items: two items in a row must not have the same value']);
    expect(check({ type: 'fill', question: 'How many of 10?', icon: '🧍', total: 10, answer: 3, explanation: 'Three.' })).toEqual([]);
    expect(check({ type: 'fill', question: 'How many of 10?', icon: '🧍', total: 10, answer: 11, explanation: 'Three.' })).toEqual(['slides[0].answer: answer cannot be more than total']);
    const place = { type: 'place', question: 'How loud?', min: 0, max: 140, answer: 110, unit: 'dB', hints: [{ label: 'Whisper', value: 30 }], explanation: 'Loud.' };
    expect(check(place)).toEqual([]);
    expect(check({ ...place, answer: 150 })).toEqual(['slides[0].answer: answer must lie between min and max']);
    expect(check({ ...place, hints: [{ label: 'Jet', value: 200 }] })).toEqual(['slides[0].hints: every hint must lie between min and max']);
  });

  it('turns schema errors into readable messages', () => {
    const { problems } = validateContent([
      file('content/posts/space/space-test-post.json', JSON.stringify(post({ tags: ['#Space'], slides: [{ type: 'list', items: ['one'] }] }))),
    ]);
    expect(problems.map((p) => p.message)).toEqual([
      'slides[0].items: Too small: expected array to have >=2 items',
      'tags[0]: Tags are lowercase letters and digits, without "#"',
    ]);
  });
});
