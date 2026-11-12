"""French narration for a long-form video: XTTS-v2, speaker Ana Florence, every line at its natural pace (speed 1).
    xtts-venv/bin/python -I frvoice.py plan <dir>     prints how many lines of rec-fr/lines.json are not recorded yet
    xtts-venv/bin/python -I frvoice.py record <dir>   records them (tts-fr.sh holds xtts.lock around this; 3 threads)
    xtts-venv/bin/python -I frvoice.py build <dir>    rec-fr/<key>.wav and measure-fr.json from the cache, rec-fr/report.txt;
                                                      prints the lines to check
rec-fr/lines.json comes from `node timing.mjs measure-fr <slug>`. The recording and its checks are the French short clips'
(fr/narrate.py, imported): take() speaks a line (XTTS, temperature 0.6, silence trimmed; takes cached in
rec-fr/cache/takes/ by words and seed), heard() is French speech recognition (faster-whisper small), score() compares
what was heard with the line letter by letter (numbers as words), tail() counts letters heard after its last word (the
model sometimes says the full stop, "point", or mumbles on), rise() catches a statement that ends on a rising tone.
A take is good with score >= 0.85, tail <= 2 letters, rise <= 1 semitone (not checked for a question), and at a natural
pace: not much slower than the voice's usual 17 characters a second (long pauses) nor much faster (a rushed take).
Up to four seeds; the best take is kept.
Each line's result is cached by its exact words (rec-fr/cache/<id>.json and .wav), so only new or reworded lines are recorded.
"""
import glob, hashlib, json, os, shutil, sys

NARRATE = '/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/fr'   # fr/narrate.py
SPEAKER, SPEED = 'Ana Florence', 1.0
CPS = 17.0                      # characters a second, Ana Florence at speed 1, pauses included (report.txt: each line's)
GOOD, TAIL, RISE = 0.85, 2, 1.0
mode, d = sys.argv[1], sys.argv[2].rstrip('/')
# The second language is French unless <slug>/lang2.txt names another (hu: Hungary 1956's films use hu/narrate.py).
if os.path.exists(f'{d}/lang2.txt') and open(f'{d}/lang2.txt').read().strip() == 'hu':
    NARRATE = '/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/hu'
rec, cache = f'{d}/rec-fr', f'{d}/rec-fr/cache'


def ident(spoken):
    return hashlib.sha1(f'xtts-v2|{SPEAKER}|{SPEED}|{spoken}'.encode()).hexdigest()[:16]


def lines():
    return json.load(open(f'{rec}/lines.json', encoding='utf-8'))


def result(spoken):
    """The line's recorded take and its checks, or None if it has none yet."""
    h = ident(spoken)
    if not (os.path.exists(f'{cache}/{h}.json') and os.path.exists(f'{cache}/{h}.wav')):
        return None
    return json.load(open(f'{cache}/{h}.json', encoding='utf-8'))


def todo():
    out, seen = [], set()
    for l in lines():
        if l['spoken'] not in seen and result(l['spoken']) is None:
            out.append(l); seen.add(l['spoken'])
    return out


def pace(spoken, seconds):
    """'slow' (long pauses, or drawn out) or 'rushed' against the voice's usual pace; None when natural."""
    usual = len(spoken) / CPS
    return 'slow' if seconds > 1.35 * usual + 0.8 else 'rushed' if seconds < 0.72 * usual else None


def problems(r):
    why = []
    if r['score'] < GOOD: why.append(f"heard {r['score']:.2f}")
    if r['tail'] >= 99: why.append("its end wasn't heard")
    elif r['tail'] > TAIL: why.append('more heard after its last word')
    if r['rise'] > RISE: why.append(f"ends rising (+{r['rise']:.1f} semitones), like a question")
    p = pace(r['spoken'], r['seconds'])
    if p == 'slow': why.append(f"slow ({r['seconds']:.1f} s): long pauses?")
    if p == 'rushed': why.append(f"rushed ({r['seconds']:.1f} s, {len(r['spoken']) / r['seconds']:.0f} characters a second)")
    return why


if mode == 'plan':
    os.makedirs(cache, exist_ok=True)
    print(len(todo()))

elif mode == 'record':
    os.makedirs(cache, exist_ok=True)
    # The libraries' messages go to rec-fr/record.log; one line per recorded line goes to the terminal too.
    log = open(f'{rec}/record.log', 'a', buffering=1)
    term = os.fdopen(os.dup(1), 'w', buffering=1)
    os.dup2(log.fileno(), 1); os.dup2(log.fileno(), 2)
    def show(msg):
        print(msg, file=term, flush=True); print(msg, file=log, flush=True)
    try:
        import torch
        torch.set_num_threads(int(os.environ.get('XTTS_THREADS', '3')))
        sys.path.insert(0, NARRATE)
        import narrate as nr
        import soundfile as sf
        nr.DE = rec                     # take() caches its takes in {DE}/cache/{pid}/
        # At most XTTS_BATCH lines a process (tts-fr.sh loops): XTTS grows about 0.1 GB a line and a long run is killed.
        lines_todo = todo()[:int(os.environ.get('XTTS_BATCH', '0')) or None]
        for n, l in enumerate(lines_todo, 1):
            say, best = l['spoken'], None
            for seed in (1, 2, 3, 4):
                wav = nr.take('takes', 0, say, SPEED, seed)
                dur, said = len(wav) / nr.SR, nr.heard(wav)
                s, t = nr.score(say, said), nr.tail(say, said)
                up = 0.0 if say.endswith('?') else nr.rise(wav)
                clean, paced = t <= TAIL and up <= RISE, pace(say, dur) is None
                good = s >= GOOD and clean and paced
                cand = (good, clean, s >= GOOD, paced, s, -dur, seed, said, t, up, wav)
                if best is None or cand[:6] > best[:6]:
                    best = cand
                if good:
                    break
            good, clean, _, paced, s, _, seed, said, t, up, wav = best
            h = ident(say)
            sf.write(f'{cache}/{h}.wav', wav, nr.SR)
            r = {'spoken': say, 'seed': seed, 'seconds': round(len(wav) / nr.SR, 3), 'score': round(s, 3), 'tail': t,
                 'rise': round(up, 2), 'paced': paced, 'heard': said}
            json.dump(r, open(f'{cache}/{h}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            why = problems(r)
            show(f"  {n:3d}/{len(lines_todo)}  {l['key']:6s} {r['seconds']:5.1f} s  heard {s:.2f}  seed {seed}{'  CHECK: ' + '; '.join(why) if why else ''}")
    except BaseException as e:
        import traceback
        traceback.print_exc()
        show(f'recording stopped: {e!r} (rec-fr/record.log has the details)')
        sys.exit(1)

elif mode == 'build':
    import soundfile as sf
    ls = lines()
    missing = [l['key'] for l in ls if result(l['spoken']) is None]
    if missing:
        raise SystemExit(f"not recorded yet: {', '.join(missing)} (run tts-fr.sh)")
    for f in glob.glob(f'{rec}/*.wav'):
        os.remove(f)
    measure, report, check, chars = {}, [], [], 0
    for l in ls:
        r, h = result(l['spoken']), ident(l['spoken'])
        shutil.copyfile(f'{cache}/{h}.wav', f"{rec}/{l['key']}.wav")
        info = sf.info(f"{rec}/{l['key']}.wav")
        sec = info.frames / info.samplerate
        measure[l['key']] = round(sec, 3)
        chars += len(l['spoken'])
        why = problems(r)
        flag = f"  CHECK: {'; '.join(why)}" if why else ''
        report.append(f"{l['key']:6s} {sec:5.1f} s  {len(l['spoken']) / sec:4.1f} c/s  heard {r['score']:.2f}  seed {r['seed']}{flag}\n"
                      f"       say:   {l['spoken']}\n       heard: {r['heard'].strip()}")
        if why:
            check.append(f"  {l['key']:6s} {'; '.join(why)}\n         say:   {l['spoken']}\n         heard: {r['heard'].strip()}")
    json.dump(measure, open(f'{d}/measure-fr.json', 'w'), indent=1)
    open(f'{rec}/report.txt', 'w', encoding='utf-8').write('\n'.join(report) + '\n')
    total = sum(measure.values())
    if check:
        print('French lines to check (reword them in FR, then run tts-fr.sh again):\n' + '\n'.join(check))
    print(f'{len(ls)} French lines, {total:.0f} s of speech, {chars / total:.1f} characters a second; '
          f'{len(check)} to check (all lines: {rec[len(os.path.dirname(d)) + 1:]}/report.txt)')
