# Build <slug>/speech.wav: each line's recording from measure.wav, moved to its place in the timeline.
# In a dialogue (lines with "who"), each speaker's lines are levelled to the same loudness first.
# French: `assemble.py <dir> fr` builds <dir>/fr/speech.wav from plan-fr.json and each line's take, rec-fr/<key>.wav (tts-fr.sh).
import json, sys
import numpy as np, soundfile as sf
d = sys.argv[1]
if sys.argv[2:] == ['fr']:
    plan, sr, clips = json.load(open(f'{d}/plan-fr.json')), None, []
    for l in plan['lines']:
        a, r = sf.read(f"{d}/rec-fr/{l['key']}.wav", dtype='float32')
        if a.ndim > 1: a = a.mean(axis=1)
        sr = sr or r
        if r != sr: raise SystemExit(f"rec-fr/{l['key']}.wav: {r} Hz, the others {sr} Hz")
        if abs(len(a) / r - l['natural']) > 0.02:
            raise SystemExit(f"rec-fr/{l['key']}.wav is not the take plan-fr.json was timed from: run tts-fr.sh again")
        clips.append(a)
    out = np.zeros(int(round(plan['duration'] * sr)) + sr, dtype='float32')
    for l, a in zip(plan['lines'], clips):
        at = int(round(l['start'] * sr)); out[at:at + len(a)] += a[:len(out) - at]
    sf.write(f'{d}/fr/speech.wav', out[:int(round(plan['duration'] * sr))], sr)
    print(f"{d}/fr/speech.wav: {len(plan['lines'])} French lines, {plan['duration']:.1f} s")
    sys.exit(0)
plan = json.load(open(f'{d}/plan.json'))
rec, sr = sf.read(f'{d}/measure.wav', dtype='float32')
if rec.ndim > 1: rec = rec.mean(axis=1)
def seg(l):
    a = int(round(l['measured'] * sr)); n = int(round((l['natural'] + 0.08) * sr))
    return rec[a:a + n]
gain = {}
speakers = sorted({l['who'] for l in plan['lines'] if 'who' in l})
if speakers:
    import pyloudnorm
    meter = pyloudnorm.Meter(sr)
    for w in speakers:
        joined = np.concatenate([seg(l) for l in plan['lines'] if l.get('who') == w])
        gain[w] = 10 ** ((-20 - meter.integrated_loudness(joined)) / 20)
        print(f'speaker {w}: {20 * np.log10(gain[w]):+.1f} dB')
out = np.zeros(int(round(plan['duration'] * sr)) + sr, dtype='float32')
for l in plan['lines']:
    s = seg(l) * gain.get(l.get('who'), 1.0); at = int(round(l['start'] * sr))
    out[at:at + len(s)] += s
sf.write(f'{d}/speech.wav', out[:int(round(plan['duration'] * sr))], sr)
print(f"{d}/speech.wav: {len(plan['lines'])} lines, {plan['duration']:.1f} s")
