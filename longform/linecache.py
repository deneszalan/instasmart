# Recording cache, one file per spoken line: rec/cache/<id>.wav, where the id is a hash of the line's voice and its exact
# spoken text. tts.sh records only lines not in the cache (in batches of 20, so a restart loses at most one batch), then
# `build` lays every line out in measure.wav at 1 + 30·i seconds and writes measure.log, as one long run would have.
#   python -I linecache.py voices <dir>          rec/voices.json (+ cast.json for a dialogue); prints the recording settings
#   python -I linecache.py plan <dir>            rec/t01.srt, … for the lines still to record; prints how many
#   python -I linecache.py absorb <dir> <batch>  store a recorded batch (rec/t01.wav + .log) in the cache
#   python -I linecache.py build <dir>           measure.wav + measure.log from the cache
#   python -I linecache.py import <dir>          store an existing measure.wav (recorded from measure.srt) in the cache
import glob, hashlib, json, os, re, sys
import numpy as np, soundfile as sf

SPACING, BATCH, LEAD, TAIL = 30, 20, 0.1, 0.6
MALE = '/home/user/text2speech/voices/narrator_male_'
mode, d = sys.argv[1], sys.argv[2]
rec, cache = f'{d}/rec', f'{d}/rec/cache'
os.makedirs(cache, exist_ok=True)

def entry(v):
    if v in ('af_heart', 'af_bella', 'af_nicole', 'am_michael'): return {'engine': 'kokoro', 'voice': v}
    if v in ('m1', 'm2'): return {'engine': 'chatterbox', 'ref-audio': f'{MALE}{v[1]}.wav', 'seed': 1}
    raise SystemExit(f'voice.txt: unknown voice {v} (use af_heart, af_bella, af_nicole, m1 or m2)')

def stamp(s):
    ms = round(s * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

def srt(cues): return '\n'.join(f'{i + 1}\n{stamp(a)} --> {stamp(b)}\n{t}\n' for i, (a, b, t) in enumerate(cues))

def label(l): return f"SPEAKER{l['who']}: " if l.get('who') else ''

def ident(l, voices):
    key = json.dumps(voices[l.get('who') or ''], sort_keys=True) + '\n' + l['spoken']
    return hashlib.sha1(key.encode()).hexdigest()[:16]

def naturals(log):
    """Cue number -> (natural seconds, the log line), whatever order the engines logged them in."""
    out = {}
    for line in open(log):
        m = re.match(r'#(\d+)(?:\s+SPEAKER\w+)?\s+\S+\s+([\d.]+)s ->', line)
        if m: out[int(m.group(1))] = (float(m.group(2)), line.rstrip('\n'))
    return out

def store(audio, sr, start, natural, logline, h):
    a = int(round((start - LEAD) * sr)); b = int(round((start + natural + TAIL) * sr))
    sf.write(f'{cache}/{h}.wav', audio[max(0, a):b], sr, subtype='FLOAT')
    json.dump({'natural': natural, 'log': logline}, open(f'{cache}/{h}.json', 'w'))

def mono(path):
    audio, sr = sf.read(path, dtype='float32')
    return (audio.mean(axis=1) if audio.ndim > 1 else audio), sr

if mode == 'voices':
    v = open(f'{d}/voice.txt').read().split()
    if len(v) == 2 and v[0].startswith('A=') and v[1].startswith('B='):
        a, b = v[0][2:], v[1][2:]
        if a == b: raise SystemExit('voice.txt: the two speakers need different voices')
        voices = {'A': entry(a), 'B': entry(b)}
        json.dump({'SPEAKERA': voices['A'], 'SPEAKERB': voices['B']}, open(f'{d}/cast.json', 'w'), indent=1)
        args = f'--voices {d}/cast.json'
    elif len(v) == 1:
        voices = {'': entry(v[0])}
        e = voices['']
        args = f"--voice {v[0]}" if e['engine'] == 'kokoro' else f"--engine chatterbox --ref-audio {e['ref-audio']} --seed 1"
    else:
        raise SystemExit('voice.txt must be one voice, or a cast: A=<voice> B=<voice>')
    json.dump(voices, open(f'{rec}/voices.json', 'w'), indent=1)
    cloned = any(e['engine'] == 'chatterbox' for e in voices.values())
    print(f"lock={'chatterbox' if cloned else 'kokoro'}; threads={3 if cloned else 1}; args='{args}'")

elif mode == 'plan':
    lines, voices = json.load(open(f'{rec}/lines.json')), json.load(open(f'{rec}/voices.json'))
    for f in glob.glob(f'{rec}/t[0-9][0-9].*'): os.remove(f)
    todo, seen = [], set()
    for l in lines:
        h = ident(l, voices)
        if not os.path.exists(f'{cache}/{h}.wav') and h not in seen: todo.append((h, l)); seen.add(h)
    for k in range(0, len(todo), BATCH):
        part = todo[k:k + BATCH]; name = f'{rec}/t{k // BATCH + 1:02}'
        open(f'{name}.srt', 'w').write(srt([(1 + j * SPACING, SPACING - 4 + j * SPACING, label(l) + l['spoken']) for j, (h, l) in enumerate(part)]))
        json.dump([h for h, l in part], open(f'{name}.json', 'w'))
    print(f'{len(todo)} of {len(lines)} lines to record')

elif mode == 'absorb':
    name = f'{rec}/{sys.argv[3]}'
    audio, sr = mono(f'{name}.wav'); nat = naturals(f'{name}.log')
    for j, h in enumerate(json.load(open(f'{name}.json'))):
        store(audio, sr, 1 + j * SPACING, nat[j + 1][0], nat[j + 1][1], h)

elif mode == 'build':
    lines, voices = json.load(open(f'{rec}/lines.json')), json.load(open(f'{rec}/voices.json'))
    clips, logs, sr = [], [], None
    for i, l in enumerate(lines):
        h = ident(l, voices)
        audio, r = mono(f'{cache}/{h}.wav'); info = json.load(open(f'{cache}/{h}.json'))
        if sr is None: sr = r
        if r != sr: raise SystemExit(f'line {i + 1}: {r} Hz, the others {sr} Hz')
        clips.append(audio)
        # the line as srt2speech logged it, renumbered to its place in the script
        logs.append(re.sub(r'^#\d+', f'#{i + 1}', info['log']))
    out = np.zeros(int(((len(lines) - 1) * SPACING + SPACING) * sr), dtype='float32')
    for i, c in enumerate(clips):
        at = int(round((1 + i * SPACING - LEAD) * sr)); out[at:at + len(c)] += c[:len(out) - at]
    sf.write(f'{d}/measure.wav', out, sr)
    open(f'{d}/measure.log', 'w').write('\n'.join(logs) + f'\nwrote {d}/measure.wav ({len(out) / sr:.1f}s): {len(lines)} cues from the line cache\n')
    print(f'{d}/measure.wav: {len(lines)} lines from the cache')

elif mode == 'import':
    voices = json.load(open(f'{rec}/voices.json'))
    cues = [b.split('\n', 2)[2].strip() for b in open(f'{d}/measure.srt').read().strip().split('\n\n')]
    audio, sr = mono(f'{d}/measure.wav'); nat = naturals(f'{d}/measure.log')
    if len(nat) != len(cues): raise SystemExit(f'measure.log has {len(nat)} lines, measure.srt {len(cues)}: not one recording')
    n = 0
    for i, cue in enumerate(cues):
        m = re.match(r'SPEAKER([AB]): (.*)$', cue, re.S)
        l = {'who': m.group(1), 'spoken': m.group(2)} if m else {'spoken': cue}
        h = ident(l, voices)
        if not os.path.exists(f'{cache}/{h}.wav'): store(audio, sr, 1 + i * SPACING, nat[i + 1][0], nat[i + 1][1], h); n += 1
    print(f'{d}: {n} recorded lines stored in the cache')
