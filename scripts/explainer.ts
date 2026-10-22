// Render an animated explainer (explainers/<post-id>.js) into a video slide for that post.
//
//   npm run explainer -- <post-id> [--name explainer] [--music <audio file> --music-start <s|auto>] [--still <s>]
//   npm run explainer -- <post-id> --name <name> --keep-sound   re-render the picture, keeping the clip's soundtrack
//   npm run explainer -- <post-id> --preview 2,9.5,20      PNG stills to check the layout
//   npm run explainer -- <post-id> --steps                 only (re)write the steps of the post's animation slide
//   npm run explainer -- <post-id> --srt captions.srt      the captions as subtitles, timed as in the clip
//   npm run explainer -- <post-id> --name <name> --narration speech.wav [--music-gap 12]
//                                                          mix a spoken track over the clip's music
//   [--edition lesefutter]                                   for a post in another edition that isn't written yet
//
// The clip's steps are the scene's captions; they are written into the post's slide for this clip,
// and keyframes sit where the player jumps to, so jumping is instant. --preview and --still take
// scene seconds; the clip plays the scene at its pace (Kit.scene's `pace`), so it is longer.
// Writes content/media/<post-id>/<name>.mp4 and <name>.jpg, checks both with the content validator
// and prints the slide JSON. Needs ffmpeg and a Chromium: set CHROMIUM_PATH, or run
// `npx playwright-core install chromium` once.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { mediaProblems } from '../shared/validate.ts';
import { maxVideoBytes, readMp4, stepStill } from '../shared/video.ts';
import { bestMusicStart } from './clip.ts';
import { postHome } from './disk.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** A path as shown in messages: relative to the repo. */
const shown = (path: string) => path.slice(root.length + 1);
const FPS = 30;
/** Longest stretch without a keyframe, so dragging the seek bar shows the picture quickly. */
const KEYFRAME_GAP = 4;
/** A step's start may come this long after a keyframe: jumping there while playing decodes that far. */
const START_NEAR = 1;

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
function writeSteps(file: string, steps: Step[], src?: string): string {
  if (steps.length < 2) throw new Error('the scene has fewer than two captions, so it has no steps');
  const data = JSON.parse(readFileSync(file, 'utf8')) as { slides?: { type: string; src?: string; animation?: boolean; steps?: Step[] }[] };
  const slide = data.slides?.find((s) => s.type === 'video' && (src ? s.src === src : s.animation));
  if (!slide) throw new Error(`${file} has no ${src ? `slide for ${src}` : 'animated video slide'}`);
  slide.steps = steps;
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return file.slice(root.length + 1);
}

/** Captions as an SRT file: numbered cues, `HH:MM:SS,mmm --> HH:MM:SS,mmm`, a blank line between. */
function srt(cues: { start: number; end: number; text: string }[]): string {
  const time = (s: number) => {
    const ms = Math.round(s * 1000);
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
  };
  return cues.map((c, i) => `${i + 1}\n${time(c.start)} --> ${time(c.end)}\n${c.text}\n`).join('\n');
}

/** A narrated clip's voice loudness, in LUFS: the music is set relative to it. */
const VOICE_LUFS = -16;

/** Integrated loudness (EBU R128) of a file's first audio track, in LUFS. */
function loudness(file: string): number {
  const r = spawnSync('ffmpeg', ['-nostats', '-i', file, '-map', '0:a:0', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /Summary:[\s\S]*?I:\s+(-?[\d.]+) LUFS/.exec(r.stderr ?? '');
  if (r.error || r.status !== 0 || !m) throw new Error(`could not measure the loudness of ${file}`);
  return Number(m[1]);
}

/**
 * Mix a spoken track (e.g. from srt2speech, made from the --srt captions) over a rendered clip's
 * music. The picture is copied as it is, so its keyframes and the post's steps still match. Both
 * tracks are measured first, so every voice comes out equally loud whatever its own level: the
 * voice at VOICE_LUFS, the music `musicGap` LU below it, dipping further while the voice speaks.
 */
function narrate(clip: string, speech: string, musicGap: number): number {
  if (!existsSync(clip)) throw new Error(`there is no clip at ${shown(clip)}; render it first`);
  if (!existsSync(speech)) throw new Error(`there is no narration at ${speech}`);
  const info = readMp4(readFileSync(clip));
  if (!info.audioCodec) throw new Error(`${shown(clip)} has no music to mix the narration over`);
  const work = mkdtempSync(join(tmpdir(), 'narrate-'));
  try {
    const old = join(work, 'old.mp4');
    writeFileSync(old, readFileSync(clip));
    const voiceGain = VOICE_LUFS - loudness(speech);
    const musicGain = VOICE_LUFS - musicGap - loudness(old);
    const mix = `[1:a]aresample=44100,aformat=channel_layouts=stereo,volume=${voiceGain.toFixed(2)}dB,apad,asplit=2[voice][key];` +
      `[0:a]volume=${musicGain.toFixed(2)}dB[music];[music][key]sidechaincompress=threshold=0.05:ratio=3:attack=30:release=600[bed];` +
      `[bed][voice]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.7:level=false,apad[a]`;
    ffmpeg(['-i', old, '-i', speech, '-filter_complex', mix, '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100', '-t', info.durationSeconds.toFixed(3), '-movflags', '+faststart', clip]);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  const problems = mediaProblems(basename(clip), readFileSync(clip));
  console.log(`Wrote ${shown(clip)} with narration (${(statSync(clip).size / 1e6).toFixed(2)} MB)`);
  if (problems.length) {
    console.error(problems.join('\n'));
    return 1;
  }
  return 0;
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
      srt: { type: 'string' },
      narration: { type: 'string' },
      'music-gap': { type: 'string', default: '12' },
      edition: { type: 'string' },
    },
  });
  const post = positionals[0];
  const scene = join(root, 'explainers', `${post}.js`);
  if (!post || !existsSync(scene)) {
    console.error(`Usage: npm run explainer -- <post-id> [--name explainer] [--music <file> --music-start <s|auto> | --keep-sound] [--still <s>]\n` +
      `       npm run explainer -- <post-id> --preview 1,5,12 | --steps | --srt <file>\n` +
      `       npm run explainer -- <post-id> --name <name> --narration <speech.wav> [--music-gap 12]\n` +
      `The scene must be at explainers/<post-id>.js (see explainers/README.md).`);
    return 1;
  }
  const name = values.name!;
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    console.error('--name must be lowercase letters, digits, "-" or "_" (no extension)');
    return 1;
  }

  const home = postHome(root, post, values.edition);
  if (values.narration) return narrate(join(home.media, `${name}.mp4`), values.narration, Number(values['music-gap']));
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
    // The scene's own length, and the clip's: the clip plays the scene at its pace.
    const sceneDuration = Number(await page.evaluate('window.DURATION'));
    const pace = Number(await page.evaluate('window.PACE ?? 1'));
    const duration = sceneDuration / pace;
    const frame = async (t: number) => Buffer.from(String(await page.evaluate(
      `window.render(${t}), document.getElementById('c').toDataURL('image/png').split(',')[1]`)), 'base64');
    const fail = () => { if (errors.length) throw new Error(`the scene threw:\n${errors.join('\n')}`); };

    // Steps are the scene's captions: the cue lists kit captions drew, or a top-level CUES list.
    // Their text comes without the colour marks (*word*), read the way Kit's rich() reads them.
    const readCues = async (): Promise<(Step & { text: string })[]> => {
      const raw = (await page.evaluate(`(() => {
        const marks = window.__marks ?? new Set(['*', '~']);
        const plain = (s) => {
          let mode = null;
          return String(s ?? '').split(' ').map((w) => {
            if (!mode && marks.has(w[0])) { mode = w[0]; w = w.slice(1); }
            if (mode) { const at = w.lastIndexOf(mode); if (at >= 0) { w = w.slice(0, at) + w.slice(at + 1); mode = null; } }
            return w;
          }).join(' ');
        };
        const out = [];
        const add = (cues) => { for (const c of cues) if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') out.push([c[0], c[1], plain(c[2])]); };
        for (const cues of window.__cues ?? []) add(cues);
        try { if (typeof CUES !== 'undefined') add(CUES); } catch {}
        return out;
      })()`)) as [number, number, string][];
      const round = (x: number) => Math.round(x * 100) / 100;
      const byStart = new Map<number, Step & { text: string }>();
      for (const [a, b, text] of raw) {
        const cue = { start: round(a / pace), end: round(Math.min(b / pace, duration)), text };
        if (cue.end > cue.start && !byStart.has(cue.start)) byStart.set(cue.start, cue);
      }
      return [...byStart.values()].sort((x, y) => x.start - y.start);
    };
    const readSteps = async (): Promise<Step[]> => (await readCues()).map(({ start, end }) => ({ start, end }));

    if (values.srt) {
      for (let t = 0; t < sceneDuration; t += 0.25) await page.evaluate(`window.render(${t})`);
      fail();
      const cues = await readCues();
      writeFileSync(values.srt, srt(cues));
      console.log(`${cues.length} captions written to ${values.srt}`);
      return 0;
    }

    if (values.steps) {
      for (let t = 0; t < sceneDuration; t += 0.25) await page.evaluate(`window.render(${t})`);
      fail();
      const steps = await readSteps();
      const where = writeSteps(home.file, steps);
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
      if (!enc.stdin.write(await frame((i / FPS) * pace))) await new Promise((r) => enc.stdin.once('drain', r));
    }
    enc.stdin.end();
    const status = await new Promise<number | null>((r) => enc.on('close', r));
    if (status !== 0) throw new Error('ffmpeg could not encode the frames');
    const still = await frame(Number(values.still));
    fail();

    const dir = home.media;
    mkdirSync(dir, { recursive: true });
    const clip = join(dir, `${name}.mp4`);
    // --keep-sound takes the soundtrack of the clip being replaced, untouched.
    const oldClip = join(work, 'old.mp4');
    if (values['keep-sound']) {
      if (values.music) throw new Error('use either --music or --keep-sound');
      if (!existsSync(clip) || !readMp4(readFileSync(clip)).audioCodec) throw new Error(`--keep-sound: ${shown(clip)} has no soundtrack to keep`);
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
      if (statSync(clip).size <= maxVideoBytes(duration) * 0.95) break;
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
    console.log(`Wrote ${shown(clip)} (${(statSync(clip).size / 1e6).toFixed(2)} MB, ${info.durationSeconds.toFixed(1)} s, ${info.width}×${info.height}${values['keep-sound'] ? ', soundtrack kept' : info.audioCodec ? `, music from ${musicStart} s` : ', silent'})`);
    console.log(`Wrote ${shown(poster)} (still at ${values.still} s)`);
    if (problems.length) {
      console.error(`\n${problems.join('\n')}`);
      return 1;
    }
    try {
      console.log(`${steps.length} steps written to ${writeSteps(home.file, steps, `${name}.mp4`)}`);
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
