#!/bin/bash
# French: render the French picture and mix (render-video.sh <slug> fr), then the app copy; one film after another.
ST=/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio
for s in "$@"; do
  echo "== $(date -u +%T) $s fr"
  (bash $ST/render-video.sh $s fr && bash $ST/app.sh $s fr) > $ST/logs/fr-$s.log 2>&1 && echo "ok $s fr $(date -u +%T)" || echo "FAILED $s fr (logs/fr-$s.log)"
done
echo "== chain done $(date -u +%T)"
