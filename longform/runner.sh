#!/bin/bash
# The central queue: runs the jobs in jobs.txt one at a time, in order ("<id> <command>", run from the studio).
# Finished ids go to jobs.done, failed ones to jobs.failed (both are skipped); output in logs/<id>.log, progress in runner.log.
# Safe to restart after an interruption: an unfinished job runs again. Start it with: setsid nohup bash runner.sh &
S=$(cd "$(dirname "$0")" && pwd); cd $S
exec 7>$S/runner.lock; flock -n 7 || { echo "runner already running"; exit 1; }
touch jobs.done jobs.failed
while true; do
  next=$(grep -v '^\s*#' jobs.txt | grep . | while read -r id cmd; do grep -qx "$id" jobs.done jobs.failed || { echo "$id $cmd"; break; }; done)
  if [ -z "$next" ]; then sleep 60; continue; fi
  id=${next%% *}; cmd=${next#* }
  echo "$(date '+%F %T') start $id" >> runner.log
  if bash -c "$cmd" > logs/$id.log 2>&1; then echo "$id" >> jobs.done; echo "$(date '+%F %T') done $id" >> runner.log
  else echo "$id" >> jobs.failed; echo "$(date '+%F %T') FAILED $id" >> runner.log; fi
done
