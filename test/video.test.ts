import { describe, expect, it } from 'vitest';
import { readMp4, videoProblems } from '../shared/video.ts';
import { mediaProblems, validateContent, type ContentFile } from '../shared/validate.ts';

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));
const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const zeros = (n: number) => new Array<number>(n).fill(0);

/** One MP4 box: size, four-letter type, payload. */
const box = (type: string, ...payload: number[][]) => {
  const body = payload.flat();
  return [...u32(8 + body.length), ...ascii(type), ...body];
};

interface Clip {
  seconds?: number;
  width?: number;
  video?: string;
  audio?: string | null;
  moovFirst?: boolean;
  padding?: number;
}

/** A minimal but well-formed MP4: just the boxes the reader looks at. */
function mp4({ seconds = 12, width = 480, video = 'avc1', audio = 'mp4a', moovFirst = true, padding = 0 }: Clip = {}): Uint8Array {
  const track = (handler: string, entry: string, w: number) =>
    box(
      'trak',
      box('tkhd', zeros(76), u32(w * 65536), u32(Math.round(w * 0.75) * 65536)),
      box('mdia', box('hdlr', zeros(8), ascii(handler), zeros(13)), box('minf', box('stbl', box('stsd', zeros(4), u32(1), box(entry, zeros(16)))))),
    );
  const mvhd = box('mvhd', zeros(12), u32(1000), u32(seconds * 1000), zeros(80));
  const moov = box('moov', mvhd, track('vide', video, width), ...(audio ? [track('soun', audio, 0)] : []));
  const ftyp = box('ftyp', ascii('isom'), u32(512), ascii('isomavc1'));
  const mdat = box('mdat', zeros(padding));
  return new Uint8Array(moovFirst ? [...ftyp, ...moov, ...mdat] : [...ftyp, ...mdat, ...moov]);
}

describe('readMp4', () => {
  it('reads length, size, codecs and box order', () => {
    expect(readMp4(mp4())).toEqual({ durationSeconds: 12, width: 480, height: 360, videoCodec: 'avc1', audioCodec: 'mp4a', fastStart: true });
    expect(readMp4(mp4({ audio: null, moovFirst: false }))).toMatchObject({ audioCodec: null, fastStart: false });
  });

  it('explains files that are not MP4s', () => {
    expect(() => readMp4(new TextEncoder().encode('not a video at all'))).toThrow('not an MP4');
  });
});

describe('videoProblems', () => {
  it('accepts a short H.264 clip with AAC sound', () => {
    expect(videoProblems(mp4())).toEqual([]);
    expect(mediaProblems('launch.mp4', mp4())).toEqual([]);
  });

  it('rejects clips that would not play well on a phone', () => {
    expect(videoProblems(mp4({ video: 'hvc1' })).join()).toContain('must be H.264');
    expect(videoProblems(mp4({ audio: 'opus' })).join()).toContain('must be AAC');
    expect(videoProblems(mp4({ seconds: 75 })).join()).toContain('keep it between 2 and 60 s');
    expect(videoProblems(mp4({ width: 1920 })).join()).toContain('at most 1080 px');
    expect(videoProblems(mp4({ moovFirst: false })).join()).toContain('+faststart');
    expect(videoProblems(mp4({ padding: 3_100_000 })).join()).toContain('the limit is 3000000');
  });
});

describe('video slides', () => {
  const post = (slide: object) =>
    JSON.stringify({
      id: 'space-test-post',
      field: 'space',
      title: 'A test post with a decent title',
      emoji: '🪐',
      body: 'A body that is long enough to pass validation, explaining why the thing is the way it is.',
      tags: ['test'],
      source: { label: 'Wikipedia: Venus', url: 'https://en.wikipedia.org/wiki/Venus' },
      slides: [slide],
    });
  const slide = { type: 'video', src: 'launch.mp4', poster: 'launch.jpg', alt: 'A rocket lifts off.', credit: 'NASA · Public domain · excerpt' };
  const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
  const check = (s: object, clip: Uint8Array) =>
    validateContent([
      { path: 'content/posts/space/space-test-post.json', bytes: new TextEncoder().encode(post(s)) },
      { path: 'content/media/space-test-post/launch.mp4', bytes: clip },
      { path: 'content/media/space-test-post/launch.jpg', bytes: JPG },
    ] satisfies ContentFile[]).problems.map((p) => p.message);

  it('needs a music credit exactly when the clip has sound', () => {
    expect(check({ ...slide, music: '“Track” Artist (example.org) · CC BY 4.0' }, mp4())).toEqual([]);
    expect(check(slide, mp4({ audio: null }))).toEqual([]);
    expect(check(slide, mp4())).toEqual(['slides[0]: "launch.mp4" has a soundtrack, so credit it in "music" (or remove the audio)']);
    expect(check({ ...slide, music: '“Track” Artist · CC BY 4.0' }, mp4({ audio: null }))).toEqual([
      'slides[0]: "music" is credited but "launch.mp4" has no audio track',
    ]);
  });

  it('needs the clip and its still to be present', () => {
    const problems = validateContent([{ path: 'content/posts/space/space-test-post.json', bytes: new TextEncoder().encode(post(slide)) }]).problems;
    expect(problems.map((p) => p.message)).toEqual([
      'file "launch.mp4" is missing: add it at content/media/space-test-post/launch.mp4',
      'file "launch.jpg" is missing: add it at content/media/space-test-post/launch.jpg',
    ]);
  });

  it('accepts only local MP4 clips', () => {
    const problems = validateContent([
      { path: 'content/posts/space/space-test-post.json', bytes: new TextEncoder().encode(post({ ...slide, src: 'https://upload.wikimedia.org/clip.webm' })) },
    ]).problems.map((p) => p.message);
    expect(problems.join()).toContain('Use an .mp4 file name');
  });
});
