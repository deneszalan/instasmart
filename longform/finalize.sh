#!/bin/bash
# Finish a written video, both versions: record the final voices, move the music onto the new timings, render.
#   bash finalize.sh <slug> <voice> <A voice> <B voice>     e.g. bash finalize.sh kepler m1 m1 af_nicole
# Stops before rendering if a music track runs short or a still shows a missing character.
# ONLY=dialogue (or ONLY=monologue) does just that version. SKIP_TTS=1 keeps the recording already made (measure.wav)
# and only rebuilds the timing from it.
# Edit these scripts by writing a new file and renaming it over the old one: bash reads a running script as it goes.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1
for v in "$slug:$2" "$slug-dialogue:A=$3 B=$4"; do
  dir=${v%%:*}; d=$S/$dir
  [ "$ONLY" = dialogue ] && [ $dir = $slug ] && continue
  [ "$ONLY" = monologue ] && [ $dir != $slug ] && continue
  echo "${v#*:}" > $d/voice.txt
  [ -e $d/timeline.prev.js ] || cp $d/timeline.js $d/timeline.prev.js   # the writer's timing, kept until the music is moved
  if [ "$SKIP_TTS" = 1 ]; then node $S/timing.mjs build $dir; else bash $S/tts.sh $dir; fi
  grep -E "past cue end|faster than" $d/measure.log || true
  node $S/music-remap.mjs $dir --since $d/timeline.prev.js
  rm $d/timeline.prev.js
  D=$(node -e "console.log(require('$d/plan.json').duration)")
  node $S/render.mjs preview $dir $(node -e "const D=$D;console.log([0.05,0.3,0.5,0.7,0.97].map(f=>(f*D).toFixed(2)).join(','))") | tee $d/final-check.txt
  grep -q "NO FONT" $d/final-check.txt && { echo "$dir: a character has no font"; exit 1; }
  bash $S/render-video.sh $dir
done
