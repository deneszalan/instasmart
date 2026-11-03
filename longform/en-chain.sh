#!/bin/bash
# English: record what changed, render, make the app copy; one film after another.
ST=/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio
for s in "$@"; do
  echo "== $(date -u +%T) $s"
  (bash $ST/tts.sh $s && bash $ST/render-video.sh $s && bash $ST/app.sh $s) > $ST/logs/en-$s.log 2>&1 && echo "ok $s $(date -u +%T)" || echo "FAILED $s (logs/en-$s.log)"
done
echo "== chain done $(date -u +%T)"
