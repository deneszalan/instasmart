#!/bin/bash
# Final render of <slug>: the picture in 3 parallel chunks, then the narration and music (mix.py).
# One video at a time (render.lock), never while the cloned voice records (chatterbox.lock): the machine has 4 cores.
# Resumable: a chunk already rendered from the same timeline and scene (parts.key) is kept.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
exec 9>$S/render.lock; flock 9
exec 8>$S/chatterbox.lock; flock 8
D=$(node -e "console.log(require('$d/plan.json').duration)")
c=$(echo "$D / 3 + 1" | bc)
key=$(cat $d/timeline.js $d/scene.js $S/kit.js | md5sum | cut -d' ' -f1)
if [ ! -e $d/parts.key ]; then echo $key > $d/parts.key   # chunks from before parts.key existed are checked by length below
elif [ "$(cat $d/parts.key)" != "$key" ]; then rm -f $d/part*.mp4; echo $key > $d/parts.key; fi
for i in 0 1 2; do
  p=$d/part$((i + 1)).mp4
  want=$(node -e "console.log(Math.min(($i + 1) * $c, $D) - $i * $c)")
  have=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $p 2>/dev/null || true)
  if [ -n "$have" ] && node -e "process.exit(Math.abs($have - $want) < 0.1 ? 0 : 1)"; then echo "part $((i + 1)) kept"; continue; fi
  rm -f $p; node $S/render.mjs video $slug $p $((i * c)) $(((i + 1) * c)) > $d/render$((i + 1)).log 2>&1 &
done
wait
for i in 1 2 3; do [ -e $d/render$i.log ] && grep -q -i error $d/render$i.log && { cat $d/render$i.log; exit 1; }; done
~/.local/share/uv/tools/text2speech/bin/python -I $S/assemble.py $d
python3 -I $S/mix.py $slug
echo "decode errors: $(ffmpeg -nostdin -v error -i $d/$slug.mp4 -f null - 2>&1 | wc -l)"
