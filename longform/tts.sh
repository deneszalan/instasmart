#!/bin/bash
# Record every narration line once, in the video's voice (<slug>/voice.txt: af_heart, af_bella, af_nicole, m1 or m2).
# A dialogue casts two voices in voice.txt, e.g. "A=m1 B=af_bella" (while writing, am_michael stands in for m1/m2): lines with
# who: 'A' or 'B' are spoken by them.
# Lines are recorded in batches of 20 (rec/b01.srt, …); a batch already recorded with the same lines and voices is kept,
# so an interrupted run picks up where it stopped. combine.py then joins the batches into measure.wav and measure.log.
# Threads are capped (two torch processes each taking every core slow each other down many times over):
# Kokoro 1 thread; the cloned voice 3 threads, and it takes turns with final renders (chatterbox.lock).
# Edit this file only by writing a new one and renaming it over this: bash reads a running script as it goes.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
export PATH="$HOME/.local/bin:$PATH"
export OMP_WAIT_POLICY=PASSIVE
K="env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1"; C="env OMP_NUM_THREADS=3 MKL_NUM_THREADS=3"
# The cloned voice lets a waiting final render go first (a render holds render.lock while it waits for chatterbox.lock).
yield() { until flock -n $S/render.lock true; do sleep 20; done; }
male=/home/user/text2speech/voices/narrator_male_
entry() { case $1 in
  af_heart|af_bella|af_nicole|am_michael) echo "{\"engine\": \"kokoro\", \"voice\": \"$1\"}" ;;
  m1|m2) echo "{\"engine\": \"chatterbox\", \"ref-audio\": \"$male${1#m}.wav\", \"seed\": 1}" ;;
  *) echo "voice.txt: unknown voice $1 (use af_heart, af_bella, af_nicole, m1 or m2)" >&2; exit 1 ;;
esac; }
node $S/timing.mjs measure $slug
v=$(cat $d/voice.txt)
case $v in
  A=*" B="*)
    a=${v#A=}; a=${a%% *}; b=${v##*B=}; b=${b%% *}
    [ "$a" != "$b" ] || { echo "voice.txt: the two speakers need different voices"; exit 1; }
    ea=$(entry $a); eb=$(entry $b)
    printf '{\n "SPEAKERA": %s,\n "SPEAKERB": %s\n}\n' "$ea" "$eb" > $d/cast.json
    lock=kokoro; run=$K; [[ "$a$b" == *m[12]* ]] && { lock=chatterbox; run=$C; }
    args="--voices $d/cast.json"; spec=$(cat $d/cast.json) ;;
  af_heart|af_bella|af_nicole) lock=kokoro; run=$K; args="--voice $v"; spec=$v ;;
  m1|m2) lock=chatterbox; run=$C; args="--engine chatterbox --ref-audio $male${v#m}.wav --seed 1"; spec=$v ;;
  *) echo "voice.txt must be af_heart, af_bella, af_nicole, m1 or m2, or a cast: A=<voice> B=<voice>"; exit 1 ;;
esac
for f in $d/rec/b[0-9][0-9].wav; do [ -e "$f" ] && [ ! -e "${f%.wav}.srt" ] && rm -f "${f%.wav}".{wav,key,log}; done
for srt in $d/rec/b[0-9][0-9].srt; do
  n=${srt%.srt}; key=$( (cat $srt; echo "$spec") | md5sum | cut -d' ' -f1)
  if [ -e $n.wav ] && [ "$(cat $n.key 2>/dev/null)" = "$key" ]; then echo "$(basename $n): kept"; continue; fi
  rm -f $n.wav $n.key
  [ $lock = chatterbox ] && yield
  flock $S/$lock.lock $run srt2speech $srt -o $n.wav $args > $n.log 2>&1
  echo $key > $n.key
  grep '^wrote' $n.log | sed "s|$d/||"
done
~/.local/share/uv/tools/text2speech/bin/python -I $S/combine.py $d
node $S/timing.mjs build $slug
