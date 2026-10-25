import { describe, expect, it } from 'vitest';
import { maxVideoBytes, readMp4, videoProblems } from '../shared/video.ts';
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
  /** Seconds of the video track's keyframes, at 30 fps; leave out for a track without a sample table. */
  keyframes?: number[];
}

/** A minimal but well-formed MP4: just the boxes the reader looks at. */
function mp4({ seconds = 12, width = 480, video = 'avc1', audio = 'mp4a', moovFirst = true, padding = 0, keyframes }: Clip = {}): Uint8Array {
  // 30 frames a second, each 512 ticks of a 15360 timescale, as ffmpeg writes them.
  const frames = seconds * 30;
  const timing = keyframes
    ? [
        box('stts', zeros(4), u32(1), u32(frames), u32(512)),
        box('stss', zeros(4), u32(keyframes.length), ...keyframes.map((k) => u32(Math.round(k * 30) + 1))),
      ]
    : [];
  const track = (handler: string, entry: string, w: number) =>
    box(
      'trak',
      box('tkhd', zeros(76), u32(w * 65536), u32(Math.round(w * 0.75) * 65536)),
      box(
        'mdia',
        box('mdhd', zeros(12), u32(15360), u32(frames * 512), zeros(4)),
        box('hdlr', zeros(8), ascii(handler), zeros(13)),
        box('minf', box('stbl', box('stsd', zeros(4), u32(1), box(entry, zeros(16))), ...(handler === 'vide' ? timing : []))),
      ),
    );
  const mvhd = box('mvhd', zeros(12), u32(1000), u32(seconds * 1000), zeros(80));
  const moov = box('moov', mvhd, track('vide', video, width), ...(audio ? [track('soun', audio, 0)] : []));
  const ftyp = box('ftyp', ascii('isom'), u32(512), ascii('isomavc1'));
  const mdat = box('mdat', zeros(padding));
  return new Uint8Array(moovFirst ? [...ftyp, ...moov, ...mdat] : [...ftyp, ...mdat, ...moov]);
}

describe('readMp4', () => {
  it('reads length, size, codecs and box order', () => {
    expect(readMp4(mp4())).toEqual({ durationSeconds: 12, width: 480, height: 360, videoCodec: 'avc1', audioCodec: 'mp4a', fastStart: true, keyframes: [] });
    expect(readMp4(mp4({ audio: null, moovFirst: false }))).toMatchObject({ audioCodec: null, fastStart: false });
  });

  it('lists the keyframes', () => {
    expect(readMp4(mp4({ keyframes: [0, 2, 4.5] })).keyframes).toEqual([0, 2, 4.5]);
    expect(readMp4(mp4()).keyframes).toEqual([]);
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
    expect(videoProblems(mp4({ seconds: 95 })).join()).toContain('keep it between 2 and 90 s');
    expect(videoProblems(mp4({ width: 1920 })).join()).toContain('at most 1080 px');
    expect(videoProblems(mp4({ moovFirst: false })).join()).toContain('+faststart');
    expect(videoProblems(mp4({ padding: 3_100_000 })).join()).toContain('the limit for a 12.0 s clip is 3000000');
  });

  it('lets longer clips use 60 kB a second', () => {
    expect(maxVideoBytes(20)).toBe(3_000_000);
    expect(maxVideoBytes(66)).toBe(3_960_000);
    expect(maxVideoBytes(90)).toBe(5_400_000);
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
  const slide = { type: 'video', src: 'launch.mp4', poster: 'launch.jpg', alt: 'A rocket lifts off.', credit: 'NASA · Public domain · excerpt', ratings: { complexity: 3, shock: 5 } };
  const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
  const check = (s: object, clip: Uint8Array) =>
    validateContent([
      { path: 'content/posts/space/space-test-post.json', bytes: new TextEncoder().encode(post(s)) },
      { path: 'content/media/space-test-post/launch.mp4', bytes: clip },
      { path: 'content/media/space-test-post/launch.jpg', bytes: JPG },
    ] satisfies ContentFile[]).problems.map((p) => p.message);

  it('needs whole-number ratings from 1 to 10', () => {
    const { ratings: _, ...unrated } = slide;
    expect(check(unrated, mp4({ audio: null })).join()).toMatch(/ratings/);
    expect(check({ ...slide, ratings: { complexity: 0, shock: 5 } }, mp4({ audio: null })).join()).toMatch(/complexity/);
    expect(check({ ...slide, ratings: { complexity: 3, shock: 11 } }, mp4({ audio: null })).join()).toMatch(/shock/);
    expect(check({ ...slide, ratings: { complexity: 3.5, shock: 5 } }, mp4({ audio: null })).join()).toMatch(/complexity/);
  });

  it('needs a music credit exactly when the clip has sound', () => {
    expect(check({ ...slide, music: '“Track” Artist (example.org) · CC BY 4.0' }, mp4())).toEqual([]);
    expect(check(slide, mp4({ audio: null }))).toEqual([]);
    expect(check(slide, mp4())).toEqual(['slides[0]: "launch.mp4" has a soundtrack, so credit it in "music" (or remove the audio)']);
    expect(check({ ...slide, music: '“Track” Artist · CC BY 4.0' }, mp4({ audio: null }))).toEqual([
      'slides[0]: "music" is credited but "launch.mp4" has no audio track',
    ]);
  });

  it('checks the steps against each other and the clip', () => {
    const silent = mp4({ audio: null });
    const steps = (...pairs: [number, number][]) => ({ ...slide, steps: pairs.map(([start, end]) => ({ start, end })) });
    expect(check(steps([0.4, 4], [4.5, 11.9]), silent)).toEqual([]);
    expect(check(steps([0.4, 4], [6, 5]), silent)).toEqual(['slides[0].steps[1]: "end" must be after "start"']);
    expect(check(steps([5, 8], [1, 4]), silent)).toEqual(['slides[0].steps[1]: steps must be in order of "start"']);
    expect(check(steps([0.4, 4], [5, 14]), silent)).toEqual(['slides[0]: the last step ends at 14 s, after the 12.0 s clip']);
  });

  it('needs keyframes where the player jumps to and no long gaps between them', () => {
    // Stills (0.3 s before each step ends) at 3.7, 7.7 and 11.6 s; each start is under 1 s after a keyframe.
    const steps = { ...slide, steps: [{ start: 0.4, end: 4 }, { start: 4.5, end: 8 }, { start: 8.2, end: 11.9 }] };
    expect(check(steps, mp4({ audio: null, keyframes: [0, 3.7, 7.7, 11.6] }))).toEqual([]);
    expect(check(steps, mp4({ audio: null, keyframes: [0, 4.5] }))).toEqual([
      'slides[0]: no keyframe within 1 s before the step at 8.2 s starts, so jumping there is slow. `npm run explainer` encodes the keyframes; with ffmpeg, use `-force_key_frames <times>`',
      'slides[0]: no keyframe 0.3 s before 3 steps (0.4 s, 4.5 s, 8.2 s) end, where a paused clip shows them, so stepping while paused is slow. `npm run explainer` encodes the keyframes; with ffmpeg, use `-force_key_frames <times>`',
      'slides[0]: keyframes are up to 7.5 s apart, so the picture lags behind the seek bar; keep them at most 4 s apart (`npm run explainer` does)',
    ]);
    // Clips without steps are left alone.
    expect(check(slide, mp4({ audio: null, keyframes: [0, 8.3] }))).toEqual([]);
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
