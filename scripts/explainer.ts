// Render an animated explainer (explainers/<post-id>.js) into a video slide for that post.
//
//   npm run explainer -- <post-id> [--name explainer] [--music <audio file> --music-start <s|auto>] [--still <s>]
//   npm run explainer -- <post-id> --name <name> --keep-sound   re-render the picture, keeping the clip's soundtrack
//   npm run explainer -- <post-id> --preview 2,9.5,20      PNG stills to check the layout
//   npm run explainer -- <post-id> --steps                 only (re)write the steps of the post's animation slide
//
// The clip's steps are the scene's captions; they are written into the post's slide for this clip,
// and each one starts on a keyframe, so jumping to it is instant.
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
import { MAX_VIDEO_BYTES, readMp4 } from '../shared/video.ts';
import { bestMusicStart } from './clip.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
/** Longest stretch without a keyframe, so dragging the seek bar shows the picture quickly. */
const KEYFRAME_GAP = 4;
/** A step this soon after a keyframe needs no keyframe of its own: decoding that far is quick. */
const KEYFRAME_NEAR = 0.5;

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
}

/**
 * Keyframe times: the frame on screen as each step starts, and evenly spaced ones between them
 * so that no two are more than KEYFRAME_GAP apart. Keyframes cost a lot of bytes in busy scenes,
 * so there are no more than that. Each time sits a quarter frame before its frame, as ffmpeg makes
 * the first frame at or after it a keyframe.
 */
function keyframesFor(steps: Step[], duration: number): number[] {
  const end = Math.round(duration * FPS);
  const frames = [...new Set(steps.map((s) => Math.floor(s.start * FPS + 1e-6)))].sort((a, b) => a - b);
  const out: number[] = [];
  let last = 0;
  for (const f of [...frames, end]) {
    if (f < end && f - last < KEYFRAME_NEAR * FPS) continue;
    const between = Math.ceil((f - last) / (KEYFRAME_GAP * FPS)) - 1;
    for (let i = 1; i <= between; i++) out.push(Math.round(last + ((f - last) * i) / (between + 1)));
    if (f < end) out.push(f);
    last = f;
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
    const frame = async (t: number) => Buffer.from(String(await page.evaluate(
      `window.render(${t}), document.getElementById('c').toDataURL('image/png').split(',')[1]`)), 'base64');
    const fail = () => { if (errors.length) throw new Error(`the scene threw:\n${errors.join('\n')}`); };

    // Steps are the scene's captions: the cue lists kit captions drew, or a top-level CUES list.
    const readSteps = async (): Promise<Step[]> => {
      const raw = (await page.evaluate(`(() => {
        const out = [];
        const add = (cues) => { for (const c of cues) if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') out.push([c[0], c[1]]); };
        for (const cues of window.__cues ?? []) add(cues);
        try { if (typeof CUES !== 'undefined') add(CUES); } catch {}
        return out;
      })()`)) as [number, number][];
      const round = (x: number) => Math.round(x * 100) / 100;
      const byStart = new Map<number, Step>();
      for (const [a, b] of raw) {
        const step = { start: round(a), end: round(Math.min(b, duration)) };
        if (step.end > step.start && !byStart.has(step.start)) byStart.set(step.start, step);
      }
      return [...byStart.values()].sort((x, y) => x.start - y.start);
    };

    if (values.steps) {
      for (let t = 0; t < duration; t += 0.25) await page.evaluate(`window.render(${t})`);
      fail();
      const steps = await readSteps();
      const where = writeSteps(post, steps);
      console.log(`${steps.length} steps written to ${where}`);
      return 0;
    }

    if (values.preview) {
      const dir = join(tmpdir(), 'explainer-preview', post);
      mkdirSync(dir, { recursive: true });
      for (const t of values.preview.split(',').map(Number)) writeFileSync(join(dir, `t${t}.png`), await frame(t));
      fail();
      console.log(`Stills written to ${dir}`);
      return 0;
    }

    // Draw every frame into a near-lossless master, then encode the clip from it,
    // compressing harder if the clip is over the size limit.
    const master = join(work, 'master.mp4');
    const enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '8', '-pix_fmt', 'yuv420p', master], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(duration * FPS);
    for (let i = 0; i < n; i++) {
      if (!enc.stdin.write(await frame(i / FPS))) await new Promise((r) => enc.stdin.once('drain', r));
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
      if (!existsSync(clip) || !readMp4(readFileSync(clip)).audioCodec) throw new Error(`--keep-sound: ${mediaPath(post, `${name}.mp4`)} has no soundtrack to keep`);
      writeFileSync(oldClip, readFileSync(clip));
    }
    let musicStart = 0;
    if (values.music) musicStart = values['music-start'] === 'auto' ? bestMusicStart(values.music, duration) : Number(values['music-start']);
    const steps = await readSteps();
    const keyframes = keyframesFor(steps, duration).map((t) => t.toFixed(4)).join(',');
    for (const crf of [20, 24, 28, 32]) {
      const args = ['-i', master];
      if (values.music) args.push('-ss', String(musicStart), '-i', values.music);
      if (values['keep-sound']) args.push('-i', oldClip);
      args.push('-map', '0:v:0', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-profile:v', 'high');
      args.push('-force_key_frames', keyframes, '-forced-idr', '1');
      if (values['keep-sound']) {
        args.push('-map', '1:a:0', '-c:a', 'copy');
      } else if (values.music) {
        const fadeOut = Math.max(0, duration - 2.5).toFixed(2);
        args.push('-map', '1:a:0', '-af', `loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOut}:d=2.5`);
        args.push('-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100');
      } else {
        args.push('-an');
      }
      args.push('-t', String(duration), '-movflags', '+faststart', clip);
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
    console.log(`Wrote ${mediaPath(post, `${name}.mp4`)} (${(statSync(clip).size / 1e6).toFixed(2)} MB, ${info.durationSeconds.toFixed(1)} s, ${info.width}×${info.height}${info.audioCodec ? `, music from ${musicStart} s` : ', silent'})`);
    console.log(`Wrote ${mediaPath(post, `${name}.jpg`)} (still at ${values.still} s)`);
    if (problems.length) {
      console.error(`\n${problems.join('\n')}`);
      return 1;
    }
    try {
      console.log(`${steps.length} steps written to ${writeSteps(post, steps, `${name}.mp4`)}`);
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
