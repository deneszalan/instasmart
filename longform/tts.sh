#!/bin/bash
# Record every narration line once, in the video's voice (<slug>/voice.txt: af_heart, af_bella, af_nicole, m1 or m2).
# A dialogue casts two voices in voice.txt, e.g. "A=m1 B=af_bella" (while writing, am_michael stands in for m1/m2): lines with
# who: 'A' or 'B' are spoken by them.
# One engine run at a time per engine, so parallel writers don't swamp the CPU.
# Threads are capped (two torch processes each taking every core slow each other down many times over):
# Kokoro 1 thread; the cloned voice 3 threads, and it takes turns with final renders (chatterbox.lock).
export OMP_WAIT_POLICY=PASSIVE
K="env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1"; C="env OMP_NUM_THREADS=3 MKL_NUM_THREADS=3"
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
export PATH="$HOME/.local/bin:$PATH"
node $S/timing.mjs measure $slug
v=$(cat $d/voice.txt)
entry() { case $1 in
  af_heart|af_bella|af_nicole|am_michael) echo "{\"engine\": \"kokoro\", \"voice\": \"$1\"}" ;;
  m1|m2) echo "{\"engine\": \"chatterbox\", \"ref-audio\": \"/home/user/text2speech/voices/narrator_male_${1#m}.wav\", \"seed\": 1}" ;;
  *) echo "voice.txt: unknown voice $1 (use af_heart, af_bella, af_nicole, m1 or m2)" >&2; exit 1 ;;
esac; }
case $v in
  A=*" B="*)
    a=${v#A=}; a=${a%% *}; b=${v##*B=}; b=${b%% *}
    [ "$a" != "$b" ] || { echo "voice.txt: the two speakers need different voices"; exit 1; }
    ea=$(entry $a); eb=$(entry $b)
    printf '{\n "SPEAKERA": %s,\n "SPEAKERB": %s\n}\n' "$ea" "$eb" > $d/cast.json
    lock=kokoro; run=$K; [[ "$a$b" == *m[12]* ]] && { lock=chatterbox; run=$C; }
    flock $S/$lock.lock $run srt2speech $d/measure.srt -o $d/measure.wav --voices $d/cast.json > $d/measure.log 2>&1 ;;
  af_heart|af_bella|af_nicole) flock $S/kokoro.lock $K srt2speech $d/measure.srt -o $d/measure.wav --voice $v > $d/measure.log 2>&1 ;;
  m1|m2) flock $S/chatterbox.lock $C srt2speech $d/measure.srt -o $d/measure.wav --engine chatterbox --ref-audio /home/user/text2speech/voices/narrator_male_${v#m}.wav --seed 1 > $d/measure.log 2>&1 ;;
  *) echo "voice.txt must be af_heart, af_bella, af_nicole, m1 or m2, or a cast: A=<voice> B=<voice>"; exit 1 ;;
esac
grep '^wrote' $d/measure.log
node $S/timing.mjs build $slug
