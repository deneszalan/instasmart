# Soundtrack and final encode for a long-form video.
#   python3 -I mix.py <slug>
# Music: the segments in <slug>/music.json, each levelled on its own (-20 LUFS) and crossfaded:
#   [{ "file": "<mp3>", "at": <video s>, "until": <video s>, "offset": <s into the track, default 0> }, ...]
# Voice: <slug>/speech.wav (assemble.py) at -16 LUFS; the music sits 12 LU below it and dips while it speaks.
# Picture: <slug>/part1.mp4, part2.mp4, ... in order. Writes <slug>/<slug>.mp4 (H.264 + AAC, faststart).
import json, re, subprocess, sys
import os
S = os.path.dirname(os.path.abspath(__file__)); slug = sys.argv[1]; d = f'{S}/{slug}'
plan = json.load(open(f'{d}/plan.json')); D = plan['duration']
music = json.load(open(f'{d}/music.json'))
def run(args): subprocess.run(['ffmpeg', '-y', '-v', 'error', *args], check=True)
def lufs(path):
    r = subprocess.run(['ffmpeg', '-nostdin', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
# 1) the music bed
args, chains, labels = [], [], ''
for i, m in enumerate(music):
    args += ['-i', m['file']]
    off, ln = m.get('offset', 0), m['until'] - m['at']
    fin = 0.8 if i == 0 else 2.5
    chains.append(f"[{i}:a]atrim={off}:{off + ln},asetpts=PTS-STARTPTS,loudnorm=I=-20:TP=-2:LRA=11,aresample=44100,aformat=channel_layouts=stereo,"
                  f"afade=t=in:st=0:d={fin},afade=t=out:st={max(0, ln - 3)}:d=3,adelay={int(m['at'] * 1000)}:all=1[m{i}]")
    labels += f'[m{i}]'
chains.append(f'{labels}amix=inputs={len(music)}:duration=longest:normalize=0,apad,atrim=0:{D}[bed]')
run([*args, '-filter_complex', ';'.join(chains), '-map', '[bed]', '-c:a', 'pcm_s16le', f'{d}/bed.wav'])
# 2) levels, as in scripts/explainer.ts narrate()
vg, mg = -16 - lufs(f'{d}/speech.wav'), -28 - lufs(f'{d}/bed.wav')
# 3) picture + soundtrack
parts = sorted(p for p in __import__('os').listdir(d) if re.fullmatch(r'part\d+\.mp4', p))
open(f'{d}/parts.txt', 'w').write(''.join(f"file '{p}'\n" for p in sorted(parts, key=lambda p: int(re.findall(r'\d+', p)[0]))))
run(['-f', 'concat', '-safe', '0', '-i', f'{d}/parts.txt', '-c', 'copy', f'{d}/picture.mp4'])
mix = (f'[2:a]aresample=44100,aformat=channel_layouts=stereo,volume={vg:.2f}dB,apad,asplit=2[voice][key];'
       f'[1:a]volume={mg:.2f}dB[music];[music][key]sidechaincompress=threshold=0.05:ratio=3:attack=30:release=600[ducked];'
       f'[ducked][voice]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.7:level=false,apad[a]')
run(['-i', f'{d}/picture.mp4', '-i', f'{d}/bed.wav', '-i', f'{d}/speech.wav', '-filter_complex', mix, '-map', '0:v:0', '-map', '[a]',
     '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
     '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-ar', '44100', '-t', str(D), '-movflags', '+faststart', f'{d}/{slug}.mp4'])
print(f'{d}/{slug}.mp4: voice {vg:+.1f} dB, music {mg:+.1f} dB, final {lufs(f"{d}/{slug}.mp4"):.1f} LUFS')
