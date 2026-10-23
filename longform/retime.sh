#!/bin/bash
# Rebuild a version's timing from its existing recording (no re-recording) and move its music to match.
#   bash retime.sh <dir>
set -e
S=$(cd "$(dirname "$0")" && pwd); d=$S/$1
cp $d/timeline.js $d/timeline.prev.js
[ -d $d/rec ] && ~/.local/share/uv/tools/text2speech/bin/python -I $S/combine.py $d
node $S/timing.mjs build $1
node $S/music-remap.mjs $1 --since $d/timeline.prev.js
rm $d/timeline.prev.js
