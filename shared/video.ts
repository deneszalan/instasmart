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
  };
}

export const MAX_VIDEO_BYTES = 3_000_000;
export const MIN_VIDEO_SECONDS = 2;
export const MAX_VIDEO_SECONDS = 30;
export const MAX_VIDEO_WIDTH = 1080;

/** Everything wrong with a clip, in words a contributor can act on. */
export function videoProblems(bytes: Uint8Array): string[] {
  if (bytes.length > MAX_VIDEO_BYTES) {
    return [`clip is ${bytes.length} bytes; the limit is ${MAX_VIDEO_BYTES}. Make it shorter, narrower (480 px is plenty) or more compressed`];
  }
  let info: VideoInfo;
  try {
    info = readMp4(bytes);
  } catch (err) {
    return [(err as Error).message];
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
