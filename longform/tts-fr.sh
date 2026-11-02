#!/bin/bash
# Record the French narration of <slug> (script.mjs's FR) with XTTS-v2, speaker Ana Florence, each line at its natural pace,
# then build the French timeline: <slug>/rec-fr/<key>.wav, measure-fr.json, timeline-fr.js, subtitles-fr.srt, plan-fr.json.
#   bash tts-fr.sh <slug>
# Only lines not recorded before are recorded: frvoice.py keeps every line by its exact words, so a reworded line is the
# only one recorded again. Each take is checked with French speech recognition (up to four takes a line); the lines that
# still sound wrong are listed at the end, to reword. All lines, with what was heard: <slug>/rec-fr/report.txt.
# Only one XTTS process may run on this machine: recording waits for xtts.lock (3 threads).
# Edit this file only by writing a new one and renaming it over this: bash reads a running script as it goes.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
[ -n "$slug" ] && [ -e $d/script.mjs ] || { echo "usage: bash tts-fr.sh <slug>"; exit 1; }
PY="/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/xtts-venv/bin/python -I"
node $S/timing.mjs measure-fr $slug
n=$($PY $S/frvoice.py plan $d)
if [ "$n" -gt 0 ]; then
  flock -n $S/xtts.lock true || echo "waiting for xtts.lock (another XTTS process is running)"
  echo "recording $n French lines"
  flock $S/xtts.lock env OMP_NUM_THREADS=3 MKL_NUM_THREADS=3 OMP_WAIT_POLICY=PASSIVE XTTS_THREADS=3 $PY $S/frvoice.py record $d
fi
$PY $S/frvoice.py build $d
node $S/timing.mjs build-fr $slug
# Early warning: does the music plan still fit the (usually longer) French timeline? render-video.sh <slug> fr stops if not.
if [ -e $d/music.json ]; then node $S/music-remap.mjs $slug --fr || true; fi
