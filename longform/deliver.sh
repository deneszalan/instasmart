#!/bin/bash
# Check a finished video and copy it for delivery: bash deliver.sh <dir> <file name without extension>
# Prints streams, lengths, loudness and peak; writes <dir>/final/sheet.jpg (frames at 4%, 30%, 55%, 80% and the credits)
# and copies the mp4 and its captions to ../out/<name>.mp4 and .srt.
set -e
S=$(cd "$(dirname "$0")" && pwd); d=$S/$1; m=$d/$1.mp4; out=$S/../out
# Already delivered (and cleaned up) by an earlier run: nothing to do.
if [ ! -e $m ] && [ -e $out/$2.mp4 ]; then echo "$2: already delivered"; exit 0; fi
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $m)
echo "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of csv=p=0 $m) | audio $(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 $m) | $(du -h $m | cut -f1)"
ffmpeg -nostdin -v info -i $m -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2 | tr -s ' ' | tr '\n' ' '; echo
mkdir -p $d/final; rm -f $d/final/f*.jpg
i=0; for f in 0.04 0.30 0.55 0.80; do i=$((i + 1)); ffmpeg -nostdin -v error -y -ss $(echo "$D * $f" | bc) -i $m -frames:v 1 $d/final/f$i.jpg; done
ffmpeg -nostdin -v error -y -ss $(echo "$D - 3" | bc) -i $m -frames:v 1 $d/final/f5.jpg
montage $d/final/f*.jpg -tile 3x -geometry 640x360+4+4 $d/final/sheet.jpg
mkdir -p $out; cp $m $out/$2.mp4; cp $d/subtitles.srt $out/$2.srt
echo "sheet: $d/final/sheet.jpg  ->  $out/$2.mp4"
# Free the disk: everything below can be made again (measure.wav from the line cache, the rest by rendering).
rm -f "${d:?}"/part*.mp4 "${d:?}/picture.mp4" "${d:?}/bed.wav" "${d:?}/speech.wav" "${d:?}/$1.mp4"
[ -d "${d:?}/rec/cache" ] && rm -f "${d:?}/measure.wav"
rm -rf "${d:?}/prev"
