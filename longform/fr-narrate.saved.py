"""French narration for Tunisia 1943 clips: XTTS-v2, speaker Ana Florence, one line per caption cue, fitted to its cue.

    xtts-venv/bin/python -I fr/narrate.py [--threads N] <post-id> ...

Reads $S/fr/<id>.lines.txt (one French line per cue of $S/narr/<id>.srt) and writes $S/fr/<id>.wav, a track as
long as the English clip with each line starting at its cue, and $S/fr/<id>.log. Adapted from de/narrate.py.

Each line is spoken without its final full stop (XTTS sometimes reads it out as "point"), at a speed picked from its length and its room (until the next cue starts), at most x1.25,
then checked: French speech recognition must hear the line's words (letter by letter, numbers as words) and nothing
after its last word (the model sometimes says the full stop), a statement must not end on a rising tone,
and the take must fit. A take that fails
(the model sometimes adds pauses or mumbles) is spoken again with another seed, up to four takes; the best is
kept and squeezed to fit if needed (at most x1.12 more). Takes are cached by text, speed and seed.
XTTS-v2 is under the Coqui Public Model License (non-commercial), fine for this personal project.
"""
import difflib, hashlib, os, re, subprocess, sys
os.environ['COQUI_TOS_AGREED'] = '1'
import numpy as np, soundfile as sf, torch, librosa

S = '/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad'
DE, N, SR, SPEAKER = f'{S}/fr', f'{S}/narr', 24000, 'Ana Florence'
CHARS_PER_SECOND = 14.0  # Ana Florence in French at speed 1: a first estimate, check the logs
_tts = _asr = None


def tts():
    global _tts
    if _tts is None:
        from TTS.api import TTS
        _tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2').to('cpu')
    return _tts


def asr():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=torch.get_num_threads())
    return _asr


def spoken(text):
    """The text as letters only, with numbers as French number words: 1943 → mille neuf cent quarante-trois."""
    from num2words import num2words
    def word(m):
        n = int(re.sub(r'[\s\u00a0\u202f.]', '', m.group()))
        return num2words(n, lang='fr').lower()
    text = re.sub(r'\d{1,3}(?:[\s\u00a0\u202f.]\d{3})+|\d+', word, text.lower())
    text = text.replace('œ', 'oe').replace('æ', 'ae')
    return re.sub(r'[^a-zàâäçéèêëîïôöùûüÿ]', '', text)


def heard(wav):
    audio = librosa.resample(wav, orig_sr=SR, target_sr=16000)
    segs, _ = asr().transcribe(audio, language='fr', beam_size=5, vad_filter=False)
    return ' '.join(s.text.strip() for s in segs)


def score(text, said):
    """How closely what the recogniser heard matches the line, letter by letter: missing and extra words both count."""
    a, b = spoken(text), spoken(said)
    if not a:
        return 1.0
    if len(b) > len(a) * 1.08 + 4:
        return 0.5  # extra sounds the line doesn't have: the model mumbled on
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()


def tail(text, said):
    """Letters heard after the line's last word, beyond the ones it misheard: the model sometimes says the full stop
    ("point") or mumbles on. 99 if the line's end wasn't heard at all."""
    a, b = spoken(text), spoken(said)
    blocks = [m for m in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks() if m.size >= 3]
    if not blocks or blocks[-1].a + blocks[-1].size < len(a) - 3:
        return 99
    m = blocks[-1]
    return (len(b) - m.b - m.size) - (len(a) - m.a - m.size)


def rise(wav):
    """How far the line's last half second of voice sits above its median pitch, in semitones: a statement should
    fall at its end, but without the full stop the model sometimes ends on a rising, question-like tone."""
    f0, voiced, _ = librosa.pyin(wav, fmin=120, fmax=400, sr=SR, frame_length=1024, hop_length=256)
    f0 = f0[voiced & ~np.isnan(f0)]
    if len(f0) < 20:
        return 0.0
    return float(12 * np.log2(np.median(f0[-int(0.5 * SR / 256):]) / np.median(f0)))


def take(pid, i, text, speed, seed):
    key = hashlib.sha1(f'{SPEAKER}|{speed:.3f}|{seed}|t0.6|{text}'.encode()).hexdigest()[:12]
    path = f'{DE}/cache/{pid}/{i:02d}-{key}.wav'
    if os.path.exists(path):
        return sf.read(path, dtype='float32')[0]
    torch.manual_seed(seed)
    wav = np.asarray(tts().tts(text=text, speaker=SPEAKER, language='fr', speed=speed, temperature=0.6, split_sentences=False), dtype=np.float32)
    wav, _ = librosa.effects.trim(wav, top_db=38)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sf.write(path, wav, SR)
    return wav


def cues(pid):
    sec = lambda t: int(t[:2]) * 3600 + int(t[3:5]) * 60 + float(t[6:].replace(',', '.'))
    out = []
    for b in open(f'{N}/{pid}.srt').read().strip().split('\n\n'):
        a, z = b.split('\n')[1].split(' --> ')
        out.append((sec(a), sec(z)))
    return out


def clip_seconds(pid):
    clip = next(f for f in os.listdir(f'{N}/orig') if f.startswith(f'{pid}--'))
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{N}/orig/{clip}'],
                                capture_output=True, text=True).stdout)


def line(pid, i, text, room):
    speed = min(1.25, max(1.0, (len(text) / CHARS_PER_SECOND + 0.2) / room))
    say = text.rstrip('.')  # with its full stop, the model may say it: "point"
    best = None
    for seed in (1, 2, 3, 4):
        wav = take(pid, i, say, speed, seed)
        dur, said = len(wav) / SR, heard(wav)
        s, t = score(text, said), tail(text, said)
        up = 0.0 if text.endswith('?') else rise(wav)
        fits, clean = dur <= room * 1.12, t <= 2 and up <= 1.0
        good = s >= 0.85 and clean
        cand = (good and fits, clean, s, -dur, wav, said)
        if best is None or cand[:4] > best[:4]:
            best = cand
        if good and fits:
            break
        if good and not fits and speed < 1.25:
            speed = min(1.25, speed * dur / room)  # the words were right, just too slow
    ok, _, s, _, wav, said = best
    squeeze = 1.0
    if len(wav) / SR > room:
        squeeze = min(1.12, len(wav) / SR / room)
        wav = librosa.effects.time_stretch(wav, rate=squeeze)
    return wav, speed * squeeze, s, said, ok


def narrate(pid):
    lines = [l.strip() for l in open(f'{DE}/{pid}.lines.txt', encoding='utf-8') if l.strip()]
    windows = cues(pid)
    assert len(lines) == len(windows), f'{pid}: {len(lines)} lines for {len(windows)} cues'
    total = clip_seconds(pid)
    track = np.zeros(int(total * SR) + SR, dtype=np.float32)
    log = []
    for i, (text, (start, end)) in enumerate(zip(lines, windows)):
        nxt = windows[i + 1][0] if i + 1 < len(windows) else total - 0.3
        room = max(end, nxt - 0.12) - start
        wav, speed, s, said, ok = line(pid, i, text, room)
        at = int(start * SR)
        track[at:at + len(wav)] += wav[: len(track) - at]
        flag = '' if ok and len(wav) / SR <= room + 0.05 else '  # CHECK'
        log.append(f'{i + 1:2d} {len(wav) / SR:4.1f}s of {room:4.1f}s  x{speed:.2f}  heard {s:.2f}{flag}\n   {text}\n   {said}')
    sf.write(f'{DE}/{pid}.wav', track[: int(total * SR)], SR)
    open(f'{DE}/{pid}.log', 'w').write('\n'.join(log) + '\n')
    open(f'{DE}/{pid}.done', 'w').write(hashlib.sha1('\n'.join(lines).encode()).hexdigest())
    print(f'{pid}: {sum("# CHECK" in l for l in log)} to check of {len(log)}', flush=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--threads']:
        torch.set_num_threads(int(args[1]))
        args = args[2:]
    for pid in args:
        narrate(pid)
