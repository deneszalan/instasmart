#!/bin/bash
# Final render of <slug>: the picture in 3 parallel chunks, then the narration and music (mix.py).
# One video at a time (render.lock): the machine has 4 cores.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
exec 9>$S/render.lock; flock 9
D=$(node -e "console.log(require('$d/plan.json').duration)")
c=$(echo "$D / 3 + 1" | bc)
rm -f $d/part*.mp4
for i in 0 1 2; do node $S/render.mjs video $slug $d/part$((i + 1)).mp4 $((i * c)) $(((i + 1) * c)) > $d/render$((i + 1)).log 2>&1 & done
wait
for i in 1 2 3; do grep -q -i error $d/render$i.log && { cat $d/render$i.log; exit 1; }; done
~/.local/share/uv/tools/text2speech/bin/python -I $S/assemble.py $d
python3 -I $S/mix.py $slug
echo "decode errors: $(ffmpeg -v error -i $d/$slug.mp4 -f null - 2>&1 | wc -l)"
