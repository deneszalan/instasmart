# Join the batch recordings (rec/b01.wav, …) into measure.wav and their logs into measure.log, as if recorded in one run:
# line i of the script then starts at 1 + 30·i seconds, which is what timing.mjs and assemble.py expect. Cue numbers in the
# logs restart in every batch, so they are renumbered (#3 of batch 2 becomes #23).
import glob, os, re, sys
import numpy as np, soundfile as sf
d = sys.argv[1]; BATCH, SPACING = 20, 30
wavs = sorted(glob.glob(f'{d}/rec/b[0-9][0-9].wav'))
parts, sr = [], None
for i, w in enumerate(wavs):
    a, r = sf.read(w, dtype='float32')
    if a.ndim > 1: a = a.mean(axis=1)
    if sr is None: sr = r
    if r != sr: raise SystemExit(f'{w}: {r} Hz, the others {sr} Hz')
    if i < len(wavs) - 1:
        n = BATCH * SPACING * sr
        a = np.pad(a, (0, max(0, n - len(a))))[:n]
    parts.append(a)
sf.write(f'{d}/measure.wav', np.concatenate(parts), sr)
with open(f'{d}/measure.log', 'w') as out:
    for b, w in enumerate(wavs):
        out.write(re.sub(r'^#(\d+)', lambda m: f'#{int(m.group(1)) + b * BATCH}', open(w[:-4] + '.log').read(), flags=re.M))
print(f'{d}/measure.wav: {len(wavs)} batches, {sum(len(p) for p in parts) / sr:.1f} s')
