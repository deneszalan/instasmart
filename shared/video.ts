/**
 * Just enough of the MP4 (ISO base media) format to check a clip before it ships:
 * its length, which codecs it uses, its size on screen and whether it can start
 * playing before the whole file has downloaded.
 */

export interface VideoInfo {
  durationSeconds: number;
  width: number;
  height: number;
  /** Sample entry of the video track, e.g. "avc1" for H.264. */
  videoCodec: string | null;
  /** Sample entry of the audio track, e.g. "mp4a" for AAC, or null when silent. */
  audioCodec: string | null;
  /** The index (moov) comes before the media data (mdat), so playback can start early. */
  fastStart: boolean;
  /**
   * When the video track's keyframes are shown, in seconds. A player can only start decoding at
   * one, so seeking to a moment far from the keyframe before it is slow.
   */
  keyframes: number[];
}

interface Box {
  type: string;
  /** Start of the box's payload (after its header). */
  start: number;
  end: number;
}

const view = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const fourcc = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

/** The boxes directly inside bytes[start, end). */
function boxes(bytes: Uint8Array, start: number, end: number): Box[] {
  const dv = view(bytes);
  const out: Box[] = [];
  let at = start;
  while (at + 8 <= end) {
    let size = dv.getUint32(at);
    const type = fourcc(bytes, at + 4);
    let header = 8;
    if (size === 1) {
      if (at + 16 > end) break;
      size = Number(dv.getBigUint64(at + 8));
      header = 16;
    } else if (size === 0) {
      size = end - at;
    }
    if (size < header || at + size > end) throw new Error(`the "${type}" box runs past the end of the file`);
    out.push({ type, start: at + header, end: at + size });
    at += size;
  }
  return out;
}

const child = (bytes: Uint8Array, parent: Box, type: string) => boxes(bytes, parent.start, parent.end).find((b) => b.type === type);

/** Presentation times of a track's sync samples, from its sample table (stbl) and edit list. */
function keyframeTimes(bytes: Uint8Array, trak: Box, mdia: Box, stbl: Box): number[] {
  const dv = view(bytes);
  const mdhd = child(bytes, mdia, 'mdhd');
  const stts = child(bytes, stbl, 'stts');
  if (!mdhd || !stts) return [];
  const timescale = dv.getUint32(mdhd.start + (bytes[mdhd.start] === 1 ? 20 : 12));
  if (!timescale) return [];
  // Each table is a full box: version/flags, an entry count, then the entries.
  const table = (box: Box | undefined, width: number) => {
    if (!box) return [];
    const count = dv.getUint32(box.start + 4);
    return Array.from({ length: Math.min(count, (box.end - box.start - 8) / width) }, (_, i) => box.start + 8 + i * width);
  };
  // Decode time of every sample (stts), shifted by its composition offset (ctts).
  const times: number[] = [];
  let t = 0;
  for (const at of table(stts, 8)) {
    const n = dv.getUint32(at);
    const delta = dv.getUint32(at + 4);
    for (let i = 0; i < n; i++, t += delta) times.push(t);
  }
  const ctts = child(bytes, stbl, 'ctts');
  let sample = 0;
  for (const at of table(ctts, 8)) {
    const n = dv.getUint32(at);
    const offset = bytes[ctts!.start] === 1 ? dv.getInt32(at + 4) : dv.getUint32(at + 4);
    for (let i = 0; i < n && sample < times.length; i++) times[sample++] += offset;
  }
  // The edit list says which media time is shown first (ffmpeg uses it to hide the B-frame delay).
  let shift = 0;
  const edts = child(bytes, trak, 'edts');
  const elst = edts && child(bytes, edts, 'elst');
  if (elst) {
    const v1 = bytes[elst.start] === 1;
    for (const at of table(elst, v1 ? 20 : 12)) {
      const mediaTime = v1 ? Number(dv.getBigInt64(at + 8)) : dv.getInt32(at + 4);
      if (mediaTime >= 0) {
        shift = mediaTime;
        break;
      }
    }
  }
  const stss = child(bytes, stbl, 'stss');
  // Without a sync sample table, every sample is a keyframe.
  const sync = stss ? table(stss, 4).map((at) => dv.getUint32(at) - 1) : times.map((_, i) => i);
  return sync
    .filter((i) => i >= 0 && i < times.length)
    .map((i) => Math.max(0, (times[i] - shift) / timescale))
    .sort((a, b) => a - b);
}

/** Read an MP4's basic facts, or throw with a readable reason. */
export function readMp4(bytes: Uint8Array): VideoInfo {
  if (bytes.length < 16 || fourcc(bytes, 4) !== 'ftyp') throw new Error('the file is not an MP4 (it should start with an "ftyp" box)');
  const top = boxes(bytes, 0, bytes.length);
  const moovAt = top.findIndex((b) => b.type === 'moov');
  const mdatAt = top.findIndex((b) => b.type === 'mdat');
  if (moovAt < 0) throw new Error('the MP4 has no "moov" index box');
  const moov = top[moovAt];
  const dv = view(bytes);

  const mvhd = child(bytes, moov, 'mvhd');
  if (!mvhd) throw new Error('the MP4 has no "mvhd" header');
  const v1 = bytes[mvhd.start] === 1;
  const timescale = dv.getUint32(mvhd.start + (v1 ? 20 : 12));
  const duration = v1 ? Number(dv.getBigUint64(mvhd.start + 24)) : dv.getUint32(mvhd.start + 16);

  let width = 0;
  let height = 0;
  let videoCodec: string | null = null;
  let audioCodec: string | null = null;
  let keyframes: number[] = [];
  for (const trak of boxes(bytes, moov.start, moov.end).filter((b) => b.type === 'trak')) {
    const mdia = child(bytes, trak, 'mdia');
    const hdlr = mdia && child(bytes, mdia, 'hdlr');
    const handler = hdlr ? fourcc(bytes, hdlr.start + 8) : '';
    const minf = mdia && child(bytes, mdia, 'minf');
    const stbl = minf && child(bytes, minf, 'stbl');
    const stsd = stbl && child(bytes, stbl, 'stsd');
    // stsd is a full box: version/flags and an entry count come before its sample entries.
    const entry = stsd && boxes(bytes, stsd.start + 8, stsd.end)[0];
    if (handler === 'vide' && !videoCodec) {
      videoCodec = entry?.type ?? 'unknown';
      if (stbl) keyframes = keyframeTimes(bytes, trak, mdia, stbl);
      const tkhd = child(bytes, trak, 'tkhd');
      if (tkhd) {
        const at = tkhd.start + (bytes[tkhd.start] === 1 ? 88 : 76);
        width = Math.round(dv.getUint32(at) / 65536);
        height = Math.round(dv.getUint32(at + 4) / 65536);
      }
    } else if (handler === 'soun' && !audioCodec) {
      audioCodec = entry?.type ?? 'unknown';
    }
  }

  return {
    durationSeconds: timescale ? duration / timescale : 0,
    width,
    height,
    videoCodec,
    audioCodec,
    fastStart: mdatAt < 0 || moovAt < mdatAt,
    keyframes,
  };
}

/** A paused step is shown this long before it ends, before its caption starts to fade out. */
export const STEP_STILL_BEFORE_END = 0.3;

/**
 * The moment that shows a step finished: its picture complete and its caption still on screen.
 * Step mode stops here, and jumping between steps while paused lands here.
 */
export const stepStill = (step: { start: number; end: number }) => Math.max(step.start, step.end - STEP_STILL_BEFORE_END);

/** A clip may use 3 MB, or 60 kB a second if that is more: 5.4 MB at 90 s. */
export const maxVideoBytes = (seconds: number) => Math.max(3_000_000, Math.round(seconds * 60_000));
export const MIN_VIDEO_SECONDS = 2;
export const MAX_VIDEO_SECONDS = 90;
export const MAX_VIDEO_WIDTH = 1080;

/** Everything wrong with a clip, in words a contributor can act on. */
export function videoProblems(bytes: Uint8Array): string[] {
  let info: VideoInfo;
  try {
    info = readMp4(bytes);
  } catch (err) {
    return [(err as Error).message];
  }
  const limit = maxVideoBytes(info.durationSeconds);
  if (bytes.length > limit) {
    return [`clip is ${bytes.length} bytes; the limit for a ${info.durationSeconds.toFixed(1)} s clip is ${limit}. Make it shorter, narrower (480 px is plenty) or more compressed`];
  }
  const problems: string[] = [];
  if (info.videoCodec !== 'avc1' && info.videoCodec !== 'avc3') {
    problems.push(`the video track must be H.264 (avc1) so every phone can play it; it is ${info.videoCodec ?? 'missing'}. \`npm run clip\` encodes it correctly`);
  }
  if (info.audioCodec && info.audioCodec !== 'mp4a') problems.push(`the audio track must be AAC (mp4a); it is ${info.audioCodec}`);
  if (info.durationSeconds < MIN_VIDEO_SECONDS || info.durationSeconds > MAX_VIDEO_SECONDS) {
    problems.push(`clip is ${info.durationSeconds.toFixed(1)} s long; keep it between ${MIN_VIDEO_SECONDS} and ${MAX_VIDEO_SECONDS} s`);
  }
  if (info.width > MAX_VIDEO_WIDTH) problems.push(`clip is ${info.width} px wide; keep it at most ${MAX_VIDEO_WIDTH} px (480–720 px is plenty on a phone)`);
  if (!info.fastStart) problems.push('the index comes after the video data, so playback has to wait for the whole file. Re-encode with `-movflags +faststart` (`npm run clip` does this)');
  return problems;
}
