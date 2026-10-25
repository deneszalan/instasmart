#!/bin/bash
# Start finalize.sh for one video, detached, marking <slug>/finalize.done or .failed when it ends.
#   [ONLY=dialogue|monologue] [SKIP_TTS=1] bash run-finalize.sh <slug> <voice> <A voice> <B voice>
S=$(cd "$(dirname "$0")" && pwd); d=$S/$1
rm -f $d/finalize.done $d/finalize.failed
setsid nohup env ONLY="$ONLY" SKIP_TTS="$SKIP_TTS" bash -c "bash $S/finalize.sh $* > $d/finalize.log 2>&1 && touch $d/finalize.done || touch $d/finalize.failed" > /dev/null 2>&1 < /dev/null &
