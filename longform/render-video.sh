#!/bin/bash
# Final render of <slug>: the picture in 3 parallel chunks, then the narration and music (mix.py).
#   bash render-video.sh <slug>      -> <slug>/<slug>.mp4
#   bash render-video.sh <slug> fr   -> <slug>/<slug>-fr.mp4: the French picture (timeline-fr.js, labels-fr.json) in <slug>/fr/,
#                                       its speech from plan-fr.json and rec-fr/, the music moved onto the French timeline
#                                       (music-fr.json, by chapters; stops first if a track runs short)
# One video at a time (render.lock), never while the cloned voice records (chatterbox.lock): the machine has 4 cores.
# Resumable: a chunk already rendered from the same timeline and scene (parts.key) is kept.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; lang=$2; d=$S/$slug
if [ "$lang" = fr ]; then
  w=$d/fr; plan=$d/plan-fr.json; tl=$d/timeline-fr.js; labels=$d/labels-fr.json; out=$d/$slug-fr.mp4
  [ -e $plan ] && [ -e $tl ] || { echo "$slug: no French timeline: run bash tts-fr.sh $slug"; exit 1; }
  [ -e $labels ] || { echo "$slug: write labels-fr.json first"; exit 1; }
  mkdir -p $w
  node $S/music-remap.mjs $slug --fr   # music.json onto the French timeline; exits 2 (and stops this) if a track runs short
elif [ -n "$lang" ]; then echo "unknown language $lang (only fr)"; exit 1
else w=$d; plan=$d/plan.json; tl=$d/timeline.js; labels=; out=$d/$slug.mp4; fi
exec 9>$S/render.lock; flock 9
exec 8>$S/chatterbox.lock; flock 8
D=$(node -e "console.log(require('$plan').duration)")
c=$(echo "$D / 3 + 1" | bc)
key=$(cat $tl $d/scene.js $S/kit.js $labels | md5sum | cut -d' ' -f1)
if [ ! -e $w/parts.key ]; then echo $key > $w/parts.key   # chunks from before parts.key existed are checked by length below
elif [ "$(cat $w/parts.key)" != "$key" ]; then rm -f $w/part*.mp4; echo $key > $w/parts.key; fi
for i in 0 1 2; do
  p=$w/part$((i + 1)).mp4
  want=$(node -e "console.log(Math.min(($i + 1) * $c, $D) - $i * $c)")
  have=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $p 2>/dev/null || true)
  if [ -n "$have" ] && node -e "process.exit(Math.abs($have - $want) < 0.1 ? 0 : 1)"; then echo "part $((i + 1)) kept"; continue; fi
  rm -f $p; node $S/render.mjs video $slug $p $((i * c)) $(((i + 1) * c)) $lang > $w/render$((i + 1)).log 2>&1 &
done
wait
for i in 1 2 3; do [ -e $w/render$i.log ] && grep -q -i error $w/render$i.log && { cat $w/render$i.log; exit 1; }; done
if [ "$lang" = fr ]; then
  ~/.local/share/uv/tools/text2speech/bin/python -I $S/assemble.py $d fr
  python3 -I $S/mix.py $slug fr
else
  [ -e $d/measure.wav ] || ~/.local/share/uv/tools/text2speech/bin/python -I $S/linecache.py build $d   # deliver.sh frees it
  ~/.local/share/uv/tools/text2speech/bin/python -I $S/assemble.py $d
  python3 -I $S/mix.py $slug
fi
echo "decode errors: $(ffmpeg -nostdin -v error -i $out -f null - 2>&1 | wc -l)"
