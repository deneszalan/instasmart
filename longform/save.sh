#!/bin/bash
# Save the long-form work into the repo (longform/), commit and push, so a stopped session loses nothing.
#   bash save.sh "<what was done>"
# Saves the tools, briefs, and each video's script, scene, timing and music plan; not recordings, renders,
# stills or downloaded research pages (all can be made again).
set -e
S=$(cd "$(dirname "$0")" && pwd); R=/home/user/instasmart; B=ccr-af3d9c73-xjzrqr
cd $R
[ "$(git branch --show-current)" = $B ] || { echo "not on $B"; exit 1; }
rm -rf longform; mkdir longform
tar -C $S -cf - --exclude './kit.js' --exclude './fonts' --exclude './_*' --exclude '*.lock' --exclude '*.bak' \
  --exclude 'research' --exclude 'prev' --exclude 'dev' --exclude '*.wav' --exclude '*.mp4' --exclude '*.mp3' \
  --exclude '*.png' --exclude '*.jpg' --exclude '*.log' --exclude 'tts.out' --exclude 'parts.txt' --exclude 'measure.srt' --exclude '__pycache__' . | tar -C longform -xf -
git add longform
if git diff --cached --quiet; then echo "nothing new to save"; exit 0; fi
git commit -q -m "Long-form videos: $1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YHAbKxQJsWorYmpbzym5Hr" -- longform
for i in 1 2 3 4 5; do git push -q -u origin $B && break; sleep $((2 ** i)); done
echo "saved: $(git log --oneline -1) ($(du -sh longform | cut -f1))"
