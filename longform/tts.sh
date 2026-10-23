#!/bin/bash
# Record the narration of <slug> in its voice (<slug>/voice.txt: af_heart, af_bella, af_nicole, m1 or m2), or for a
# dialogue a cast, e.g. "A=m1 B=af_bella" (while writing, am_michael stands in for m1/m2): lines with who: 'A' or 'B'.
# Only lines not recorded before are recorded: linecache.py keeps every recorded line by its voice and exact words, so a
# reworded line is the only one re-recorded, and an interrupted run loses at most one batch of 20.
# Threads are capped (two torch processes each taking every core slow each other down many times over):
# Kokoro 1 thread; the cloned voice 3 threads, and it takes turns with final renders (chatterbox.lock).
# Edit this file only by writing a new one and renaming it over this: bash reads a running script as it goes.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
export PATH="$HOME/.local/bin:$PATH"
export OMP_WAIT_POLICY=PASSIVE
PY="$HOME/.local/share/uv/tools/text2speech/bin/python -I"
# The cloned voice lets a waiting final render go first (a render holds render.lock while it waits for chatterbox.lock).
yield() { until flock -n $S/render.lock true; do sleep 20; done; }
node $S/timing.mjs measure $slug
eval "$($PY $S/linecache.py voices $d)"     # sets lock, threads, args
$PY $S/linecache.py plan $d
for srt in $d/rec/t[0-9][0-9].srt; do
  [ -e "$srt" ] || continue
  n=${srt%.srt}
  [ $lock = chatterbox ] && yield
  flock $S/$lock.lock env OMP_NUM_THREADS=$threads MKL_NUM_THREADS=$threads srt2speech $srt -o $n.wav $args > $n.log 2>&1
  grep -E "^wrote|past cue end|faster than" $n.log | sed "s|$d/||"
  $PY $S/linecache.py absorb $d $(basename $n)
done
$PY $S/linecache.py build $d
node $S/timing.mjs build $slug
