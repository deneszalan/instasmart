// Render an animated explainer (explainers/<post-id>.js) into a video slide for that post.
//
//   npm run explainer -- <post-id> [--name explainer] [--music <audio file> --music-start <s|auto>] [--still <s>]
//   npm run explainer -- <post-id> --name <name> --keep-sound   re-render the picture, keeping the clip's soundtrack
//   npm run explainer -- <post-id> --preview 2,9.5,20      PNG stills to check the layout
//   npm run explainer -- <post-id> --steps                 only (re)write the steps of the post's animation slide
//
// The clip's steps are the scene's captions; they are written into the post's slide for this clip,
// and keyframes sit where the player jumps to, so jumping is instant. Where a step puts more text on
// screen than there is time to read, the clip holds there: the story stops while decorative motion
// and the music carry on.
// Writes content/media/<post-id>/<name>.mp4 and <name>.jpg, checks both with the content validator
// and prints the slide JSON. Needs ffmpeg and a Chromium: set CHROMIUM_PATH, or run
// `npx playwright-core install chromium` once.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { mediaPath, mediaProblems } from '../shared/validate.ts';
import { MAX_VIDEO_BYTES, readMp4, stepStill } from '../shared/video.ts';
import { bestMusicStart, duration as mediaLength } from './clip.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
/** Longest stretch without a keyframe, so dragging the seek bar shows the picture quickly. */
const KEYFRAME_GAP = 4;
/** A step's start may come this long after a keyframe: jumping there while playing decodes that far. */
const START_NEAR = 1;
/** Text at least this big (px) is read like a caption; smaller labels are only scanned. */
const CAPTION_PX = 36;
/** Characters per second: subtitle guidance for adults is 15–17 for reading, and labels are scanned faster. */
const READ_CPS = 16;
const SCAN_CPS = 25;
/** Most time a step's labels get: a table or a crowd of labels is glanced over, not read. */
const SCAN_MAX = 2;
/** Time to find new text before reading it. */
const READ_SETTLE = 0.5;
/** Holds shorter than this aren't worth making; longer ones are capped. */
const MIN_HOLD = 0.5;
const MAX_HOLD = 4;

function browserPath(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  if (existsSync(chromium.executablePath())) return undefined;
  const known = ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  const found = known.find((p) => existsSync(p));
  if (!found) throw new Error('No Chromium found: set CHROMIUM_PATH, or run `npx playwright-core install chromium`.');
  return found;
}

function ffmpeg(args: string[]): void {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], { encoding: 'utf8' });
  if (r.error) throw new Error(`could not run ffmpeg: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg failed:\n${r.stderr}`);
}

interface Step {
  start: number;
  end: number;
  /** Seconds the clip holds at the step's still so there is time to read it. */
  hold?: number;
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Holds stretch the clip. At each step's still the story stops for the step's hold while the clip
 * runs on (scenes keep decorative motion going with k.clock), then carries on. Gives the clip's
 * length, the story time at each moment of the clip, and the steps on the clip's clock.
 */
function timeline(steps: Step[], duration: number) {
  const holds = steps.filter((s) => s.hold).map((s) => ({ at: stepStill(s), hold: s.hold! }));
  const before = (t: number) => holds.filter((h) => h.at < t).reduce((sum, h) => sum + h.hold, 0);
  return {
    length: round2(duration + before(Infinity)),
    story(clock: number) {
      let shift = 0;
      for (const h of holds) {
        if (clock < h.at + shift) break;
        if (clock < h.at + shift + h.hold) return h.at;
        shift += h.hold;
      }
      return clock - shift;
    },
    steps: steps.map((s) => ({ ...s, start: round2(s.start + before(s.start)), end: round2(s.end + before(s.end)) })),
  };
}

/**
 * Keyframe times. Each step's still (where a paused clip shows it finished) is a keyframe, so paused
 * jumps are instant; a step's start gets one too unless a keyframe comes less than START_NEAR before
 * it; and evenly spaced ones fill any stretch longer than KEYFRAME_GAP. Keyframes cost a lot of bytes
 * in busy scenes, so there are no more than that. Each time sits a quarter frame before its frame, as
 * ffmpeg makes the first frame at or after it a keyframe.
 */
function keyframesFor(steps: Step[], duration: number): number[] {
  const end = Math.round(duration * FPS);
  const frame = (t: number) => Math.floor(t * FPS + 1e-6);
  const wanted = steps
    .flatMap((step) => [
      { at: frame(step.start), near: START_NEAR * FPS },
      { at: frame(stepStill(step)), near: 0 },
    ])
    .sort((a, b) => a.at - b.at);
  const keys = [0];
  for (const { at, near } of wanted) if (at < end && at - keys[keys.length - 1] > near) keys.push(at);
  const out: number[] = [];
  keys.push(end);
  for (let i = 1; i < keys.length; i++) {
    const [a, b] = [keys[i - 1], keys[i]];
    const between = Math.ceil((b - a) / (KEYFRAME_GAP * FPS)) - 1;
    for (let j = 1; j <= between; j++) out.push(Math.round(a + ((b - a) * j) / (between + 1)));
    if (b < end) out.push(b);
  }
  return out.map((f) => (f - 0.25) / FPS);
}

/** Put the steps into the post's slide for this clip (or its animated slide); returns the file it changed. */
function writeSteps(post: string, steps: Step[], src?: string): string {
  if (steps.length < 2) throw new Error('the scene has fewer than two captions, so it has no steps');
  const file = join(root, 'content', 'posts', post.split('-')[0], `${post}.json`);
  const data = JSON.parse(readFileSync(file, 'utf8')) as { slides?: { type: string; src?: string; animation?: boolean; steps?: Step[] }[] };
  const slide = data.slides?.find((s) => s.type === 'video' && (src ? s.src === src : s.animation));
  if (!slide) throw new Error(`${file} has no ${src ? `slide for ${src}` : 'animated video slide'}`);
  slide.steps = steps;
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return file.slice(root.length + 1);
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string', default: 'explainer' },
      music: { type: 'string' },
      'music-start': { type: 'string', default: 'auto' },
      still: { type: 'string', default: '1' },
      preview: { type: 'string' },
      steps: { type: 'boolean' },
      'keep-sound': { type: 'boolean' },
    },
  });
  const post = positionals[0];
  const scene = join(root, 'explainers', `${post}.js`);
  if (!post || !existsSync(scene)) {
    console.error(`Usage: npm run explainer -- <post-id> [--name explainer] [--music <file> --music-start <s|auto> | --keep-sound] [--still <s>]\n` +
      `       npm run explainer -- <post-id> --preview 1,5,12 | --steps\n` +
      `The scene must be at explainers/<post-id>.js (see explainers/README.md).`);
    return 1;
  }
  const name = values.name!;
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    console.error('--name must be lowercase letters, digits, "-" or "_" (no extension)');
    return 1;
  }

  const browser = await chromium.launch({ executablePath: browserPath() });
  const work = mkdtempSync(join(tmpdir(), `explainer-${post}-`));
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${pathToFileURL(join(root, 'explainers', 'page.html')).href}?scene=${post}`);
    // The page code runs in the browser, so it is passed as strings (scripts/ has no DOM types).
    await page.waitForFunction('"ready" in window');
    await page.evaluate('window.ready');
    const duration = Number(await page.evaluate('window.DURATION'));
    // t is story time; clock is the clip's own time, which runs on through holds.
    const draw = (t: number, clock = t) => `window.render(${t}, ${clock})`;
    const frame = async (t: number, clock = t) => Buffer.from(String(await page.evaluate(
      `${draw(t, clock)}, document.getElementById('c').toDataURL('image/png').split(',')[1]`)), 'base64');
    const fail = () => { if (errors.length) throw new Error(`the scene threw:\n${errors.join('\n')}`); };

    if (values.preview) {
      const dir = join(tmpdir(), 'explainer-preview', post);
      mkdirSync(dir, { recursive: true });
      for (const t of values.preview.split(',').map(Number)) writeFileSync(join(dir, `t${t}.png`), await frame(t));
      fail();
      console.log(`Stills written to ${dir}`);
      return 0;
    }

    // Steps are the scene's captions: the cue lists kit captions drew, or a top-level CUES list.
    const readSteps = async (): Promise<Step[]> => {
      const raw = (await page.evaluate(`(() => {
        const out = [];
        const add = (cues) => { for (const c of cues) if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') out.push([c[0], c[1]]); };
        for (const cues of window.__cues ?? []) add(cues);
        try { if (typeof CUES !== 'undefined') add(CUES); } catch {}
        return out;
      })()`)) as [number, number][];
      const byStart = new Map<number, Step>();
      for (const [a, b] of raw) {
        const step = { start: round2(a), end: round2(Math.min(b, duration)) };
        if (step.end > step.start && !byStart.has(step.start)) byStart.set(step.start, step);
      }
      return [...byStart.values()].sort((x, y) => x.start - y.start);
    };

    // The text the story draws at full strength at t, as the strings handed to fillText, with their size in px.
    const textAt = async (t: number) =>
      (await page.evaluate(`(() => {
        const proto = CanvasRenderingContext2D.prototype;
        if (!proto.__fillText) {
          proto.__fillText = proto.fillText;
          proto.fillText = function (s, ...rest) {
            const text = String(s).trim();
            if (window.__drawn && this.globalAlpha >= 0.6 && text) window.__drawn.push([text, Number((/([0-9.]+)px/.exec(this.font) || [])[1] || 0)]);
            return proto.__fillText.call(this, s, ...rest);
          };
        }
        window.__drawn = [];
        ${draw(t)};
        const drawn = window.__drawn;
        window.__drawn = null;
        return drawn;
      })()`)) as [string, number][];

    // How long each step should hold. A reader starts on each piece of text a step adds once it
    // appears, reading captions at READ_CPS and scanning labels at SCAN_CPS (SCAN_MAX at most);
    // whatever is still unread at the step's still becomes its hold.
    const addHolds = async (steps: Step[]) => {
      let before: string[] = [];
      for (const step of steps) {
        const still = stepStill(step);
        const now = await textAt(still);
        const old = [...before];
        const added = now.filter(([text]) => {
          const i = old.indexOf(text);
          if (i < 0) return true;
          old.splice(i, 1);
          return false;
        });
        const firstSeen = new Map<string, number>();
        for (let t = step.start; t < still; t += 0.25) for (const [text] of await textAt(t)) if (!firstSeen.has(text)) firstSeen.set(text, t);
        const seen = (text: string) => Math.max(step.start, firstSeen.get(text) ?? still);
        let read = step.start + READ_SETTLE;
        let scanLeft = SCAN_MAX;
        for (const [text, px] of added.sort((a, b) => seen(a[0]) - seen(b[0]))) {
          const caption = px >= CAPTION_PX;
          const cost = caption ? (text.length + 1) / READ_CPS : Math.min(scanLeft, (text.length + 1) / SCAN_CPS);
          if (!caption) scanLeft -= cost;
          read = Math.max(read, seen(text)) + cost;
        }
        const hold = Math.min(MAX_HOLD, read - still);
        if (hold >= MIN_HOLD) step.hold = Math.round(hold * 10) / 10;
        else delete step.hold;
        before = now.map(([text]) => text);
      }
      fail();
    };

    // Every caption registers itself as it draws, so run the story through once to find the steps.
    for (let t = 0; t < duration; t += 0.25) await page.evaluate(draw(t));
    fail();
    const sceneSteps = await readSteps();
    await addHolds(sceneSteps);
    const time = timeline(sceneSteps, duration);
    const steps = time.steps;
    const holds = steps.filter((step) => step.hold);
    const holdNote = `${holds.length} hold${holds.length === 1 ? '' : 's'} for reading, ${(time.length - duration).toFixed(1)} s in all`;

    if (values.steps) {
      console.log(`${steps.length} steps (${holdNote}) written to ${writeSteps(post, steps)}`);
      return 0;
    }

    // Draw every frame into a near-lossless master, then encode the clip from it,
    // compressing harder if the clip is over the size limit.
    const master = join(work, 'master.mp4');
    const enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '8', '-pix_fmt', 'yuv420p', master], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(time.length * FPS);
    for (let i = 0; i < n; i++) {
      if (!enc.stdin.write(await frame(time.story(i / FPS), i / FPS))) await new Promise((r) => enc.stdin.once('drain', r));
    }
    enc.stdin.end();
    const status = await new Promise<number | null>((r) => enc.on('close', r));
    if (status !== 0) throw new Error('ffmpeg could not encode the frames');
    const still = await frame(Number(values.still));
    fail();

    const dir = join(root, 'content', 'media', post);
    mkdirSync(dir, { recursive: true });
    const clip = join(dir, `${name}.mp4`);
    // --keep-sound takes the soundtrack of the clip being replaced, untouched.
    const oldClip = join(work, 'old.mp4');
    if (values['keep-sound']) {
      if (values.music) throw new Error('use either --music or --keep-sound');
      const old = existsSync(clip) ? readMp4(readFileSync(clip)) : null;
      if (!old?.audioCodec) throw new Error(`--keep-sound: ${mediaPath(post, `${name}.mp4`)} has no soundtrack to keep`);
      if (Math.abs(old.durationSeconds - time.length) > 0.1) {
        throw new Error(`--keep-sound: the clip is now ${time.length} s long (${holdNote}) but its soundtrack is ${old.durationSeconds.toFixed(1)} s; lay the music again with --music`);
      }
      writeFileSync(oldClip, readFileSync(clip));
    }
    let musicStart = 0;
    if (values.music) {
      musicStart = values['music-start'] === 'auto' ? bestMusicStart(values.music, time.length) : Number(values['music-start']);
      const trackLength = mediaLength(values.music);
      if (!(musicStart >= 0 && musicStart + time.length <= trackLength + 0.01)) {
        throw new Error(`--music-start must leave ${time.length} s of the ${trackLength.toFixed(1)} s track (${holdNote}); start at ${Math.max(0, Math.floor(trackLength - time.length - 0.5))} s at the latest`);
      }
    }
    const keyframes = keyframesFor(steps, time.length).map((t) => t.toFixed(4)).join(',');
    for (const crf of [20, 24, 28, 32]) {
      const args = ['-i', master];
      if (values.music) args.push('-ss', String(musicStart), '-i', values.music);
      if (values['keep-sound']) args.push('-i', oldClip);
      args.push('-map', '0:v:0', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-profile:v', 'high');
      args.push('-force_key_frames', keyframes, '-forced-idr', '1');
      if (values['keep-sound']) {
        args.push('-map', '1:a:0', '-c:a', 'copy');
      } else if (values.music) {
        const fadeOut = Math.max(0, time.length - 2.5).toFixed(2);
        args.push('-map', '1:a:0', '-af', `loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOut}:d=2.5`);
        args.push('-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100');
      } else {
        args.push('-an');
      }
      args.push('-t', String(time.length), '-movflags', '+faststart', clip);
      ffmpeg(args);
      if (statSync(clip).size <= MAX_VIDEO_BYTES * 0.95) break;
    }
    const pngStill = join(work, 'still.png');
    writeFileSync(pngStill, still);
    const poster = join(dir, `${name}.jpg`);
    ffmpeg(['-i', pngStill, '-q:v', '3', poster]);

    const problems = [
      ...mediaProblems(`${name}.mp4`, readFileSync(clip)).map((p) => `${name}.mp4: ${p}`),
      ...mediaProblems(`${name}.jpg`, readFileSync(poster)).map((p) => `${name}.jpg: ${p}`),
    ];
    const info = readMp4(readFileSync(clip));
    console.log(`Wrote ${mediaPath(post, `${name}.mp4`)} (${(statSync(clip).size / 1e6).toFixed(2)} MB, ${info.durationSeconds.toFixed(1)} s, ${info.width}×${info.height}${values['keep-sound'] ? ', soundtrack kept' : info.audioCodec ? `, music from ${musicStart} s` : ', silent'})`);
    console.log(`Wrote ${mediaPath(post, `${name}.jpg`)} (still at ${values.still} s)`);
    if (problems.length) {
      console.error(`\n${problems.join('\n')}`);
      return 1;
    }
    try {
      console.log(`${steps.length} steps (${holdNote}) written to ${writeSteps(post, steps, `${name}.mp4`)}`);
      return 0;
    } catch {
      // The post has no slide for this clip yet.
    }
    const slide = {
      type: 'video',
      src: `${name}.mp4`,
      poster: `${name}.jpg`,
      alt: '<what the animation shows>',
      fit: 'cover',
      animation: true,
      credit: 'Reckon · original animation',
      ...(values.music ? { music: '<“Title” artist (source) · licence>' } : {}),
      ...(steps.length >= 2 ? { steps } : {}),
    };
    console.log(`\nSlide to add to the post:\n${JSON.stringify(slide, null, 2)}`);
    return 0;
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }
}

main().then((code) => process.exit(code), (err: Error) => {
  console.error(err.message);
  process.exit(1);
});
