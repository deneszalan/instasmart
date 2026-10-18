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
