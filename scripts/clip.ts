// Cut a clip for a video slide, replace its sound with a music excerpt, and make its still.
//
//   npm run clip -- <input video> --post <post-id> --name <name> --start <s> --end <s>
//                   [--music <audio file> --music-start <s|auto>] [--width 480] [--crop 4:5] [--still <s>]
//
// Writes content/media/<post-id>/<name>.mp4 (H.264, AAC, fast start) and <name>.jpg, checks both
// with the content validator, and prints the slide JSON to paste into the post. Needs ffmpeg.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { mediaPath, mediaProblems } from '../shared/validate.ts';
import { MAX_FOOTAGE_BYTES, MAX_FOOTAGE_SECONDS, MIN_VIDEO_SECONDS, readMp4 } from '../shared/video.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd: string, args: string[]): string {
  const result = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw new Error(`could not run ${cmd}: ${result.error.message}. Install ffmpeg (it includes ffprobe).`);
  if (result.status !== 0) throw new Error(`${cmd} failed:\n${result.stderr.split('\n').slice(-12).join('\n')}`);
  return `${result.stdout}${result.stderr}`;
}

export function duration(file: string): number {
  const out = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  const seconds = Number.parseFloat(out.trim());
  if (!Number.isFinite(seconds)) throw new Error(`could not read the length of ${file}`);
  return seconds;
}

/**
 * Where a music excerpt of `length` seconds should start: the window, on whole seconds,
 * with the fullest sound and no near-silence, so the clip doesn't open on a quiet intro.
 */
export function bestMusicStart(file: string, length: number): number {
  const out = run('ffmpeg', ['-nostats', '-hide_banner', '-i', file, '-filter_complex', 'ebur128', '-f', 'null', '-']);
  const points = [...out.matchAll(/t:\s*([\d.]+)\s+TARGET:[^M]*M:\s*(-?[\d.]+)/g)].map((m) => ({ t: Number(m[1]), m: Number(m[2]) }));
  const total = points.at(-1)?.t ?? 0;
  let best = 0;
  let bestScore = -Infinity;
  for (let start = 0; start + length <= total; start++) {
    const window = points.filter((p) => p.t >= start && p.t < start + length);
    if (!window.length || window.some((p) => p.m < -45)) continue;
    const score = window.reduce((sum, p) => sum + p.m, 0) / window.length;
    if (score > bestScore) {
      bestScore = score;
      best = start;
    }
  }
  return best;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      post: { type: 'string' },
      name: { type: 'string' },
      start: { type: 'string' },
      end: { type: 'string' },
      music: { type: 'string' },
      'music-start': { type: 'string', default: 'auto' },
      width: { type: 'string', default: '480' },
      crop: { type: 'string' },
      still: { type: 'string' },
    },
  });
  const input = positionals[0];
  const { post, name } = values;
  if (!input || !post || !name || values.start === undefined || values.end === undefined) {
    console.error(
      'Usage: npm run clip -- <input video> --post <post-id> --name <name> --start <s> --end <s> ' +
        '[--music <audio file> --music-start <s|auto>] [--width 480] [--crop 4:5] [--still <s>]',
    );
    return 1;
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    console.error('--name must be lowercase letters, digits, "-" or "_" (no extension)');
    return 1;
  }

  const start = Number(values.start);
  const end = Number(values.end);
  const length = end - start;
  const sourceLength = duration(input);
  if (!(start >= 0 && end <= sourceLength + 0.01 && length >= MIN_VIDEO_SECONDS && length <= MAX_FOOTAGE_SECONDS)) {
    console.error(`Pick --start/--end inside the ${sourceLength.toFixed(1)} s source, ${MIN_VIDEO_SECONDS}–${MAX_FOOTAGE_SECONDS} s apart.`);
    return 1;
  }
  const width = Number(values.width);
  const filters: string[] = [];
  if (values.crop) {
    const [w, h] = values.crop.split(':').map(Number);
    if (!(w > 0 && h > 0)) {
      console.error('--crop takes an aspect ratio such as 4:5 or 1:1');
      return 1;
    }
    filters.push(`crop='min(iw,ih*${w}/${h})':'min(ih,iw*${h}/${w})'`);
  }

  const dir = join(root, 'content', 'media', post);
  mkdirSync(dir, { recursive: true });
  const clip = join(dir, `${name}.mp4`);
  const still = join(dir, `${name}.jpg`);

  let musicStart = 0;
  if (values.music) {
    const musicLength = duration(values.music);
    musicStart = values['music-start'] === 'auto' ? bestMusicStart(values.music, length) : Number(values['music-start']);
    if (!(musicStart >= 0 && musicStart + length <= musicLength + 0.01)) {
      console.error(`--music-start must leave ${length.toFixed(1)} s of the ${musicLength.toFixed(1)} s track`);
      return 1;
    }
  }

  // Re-encode, compressing harder until the clip fits the size limit.
  for (const crf of [26, 29, 32, 35]) {
    const args = ['-y', '-v', 'error', '-ss', String(start), '-to', String(end), '-i', input];
    if (values.music) args.push('-ss', String(musicStart), '-i', values.music);
    args.push('-map', '0:v:0');
    args.push('-vf', [...filters, `scale='min(${width},iw)':-2`].join(','), '-fpsmax', '30');
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-profile:v', 'high');
    // A keyframe at least every 2 s, so the picture follows the seek bar quickly.
    args.push('-force_key_frames', 'expr:gte(t,n_forced*2)');
    if (values.music) {
      const fadeOut = Math.max(0, length - 1.2).toFixed(2);
      args.push('-map', '1:a:0', '-af', `loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:st=0:d=0.5,afade=t=out:st=${fadeOut}:d=1.2`);
      args.push('-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100');
    } else {
      args.push('-an');
    }
    args.push('-t', String(length), '-movflags', '+faststart', clip);
    run('ffmpeg', args);
    if (statSync(clip).size <= MAX_FOOTAGE_BYTES * 0.95) break;
  }

  const stillAt = start + (values.still === undefined ? Math.min(1, length / 2) : Number(values.still));
  run('ffmpeg', ['-y', '-v', 'error', '-ss', String(stillAt), '-i', input, '-frames:v', '1', '-vf', [...filters, "scale='min(960,iw)':-2"].join(','), '-q:v', '4', still]);

  const problems = [
    ...mediaProblems(`${name}.mp4`, readFileSync(clip)).map((p) => `${name}.mp4: ${p}`),
    ...mediaProblems(`${name}.jpg`, readFileSync(still)).map((p) => `${name}.jpg: ${p}`),
  ];
  const info = readMp4(readFileSync(clip));
  console.log(`Wrote ${mediaPath(post, `${name}.mp4`)} (${(statSync(clip).size / 1e6).toFixed(2)} MB, ${info.durationSeconds.toFixed(1)} s, ${info.width}×${info.height}${info.audioCodec ? ', music from ' + musicStart + ' s' : ', silent'})`);
  console.log(`Wrote ${mediaPath(post, `${name}.jpg`)} (still at ${stillAt.toFixed(1)} s of the source)`);
  if (problems.length) {
    console.error(`\n${problems.join('\n')}`);
    return 1;
  }
  const slide = {
    type: 'video',
    src: `${name}.mp4`,
    poster: `${name}.jpg`,
    alt: '<what the clip shows>',
    caption: '<optional, ≤200 characters>',
    credit: '<footage author · licence · excerpt>',
    href: '<https:// page of the footage>',
    ...(values.music ? { music: '<“Title” artist (source) · licence>' } : {}),
  };
  console.log(`\nSlide to add to the post:\n${JSON.stringify(slide, null, 2)}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main());
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
