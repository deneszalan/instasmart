#!/bin/bash
# The phone app's copy of a finished video, and its poster:
#   bash app.sh <slug>      <slug>/<slug>.mp4    -> <slug>/app/<slug>.mp4 and <slug>/app/<slug>.jpg
#   bash app.sh <slug> fr   <slug>/<slug>-fr.mp4 -> <slug>/app/<slug>-fr.mp4 and <slug>/app/<slug>-fr.jpg
# Video: 1280×720, H.264 high profile (level 4.0) tuned for animation, CRF 23 capped at 560 kb/s (with the sound, at most about
# 5 MB a minute), a keyframe at least every 4 s (120 frames), faststart; sound: AAC 96 kb/s stereo.
# Poster: a 1280×720 JPEG of the cold-open title, just before the first chapter card (or at POSTER = ['<key>', <seconds
# after that line starts>] if script.mjs exports it), from the 1080p video. Prints the sizes.
# Takes render.lock, like a final render: one heavy job at a time on this machine.
set -e
S=$(cd "$(dirname "$0")" && pwd); slug=$1; d=$S/$slug
case "$2" in
  fr) sfx=-fr; tl=$d/timeline-fr.js ;;
  "") sfx=; tl=$d/timeline.js ;;
  *) echo "usage: bash app.sh <slug> [fr]"; exit 1 ;;
esac
src=$d/$slug$sfx.mp4; out=$d/app/$slug$sfx
[ -e $src ] || { echo "$slug: no $slug$sfx.mp4 yet: run bash render-video.sh $slug $2"; exit 1; }
mkdir -p $d/app
P=$(node -e "
  const tl = JSON.parse(require('fs').readFileSync('$tl', 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*\$/, ''));
  import('file://$d/script.mjs').then(({ POSTER: p }) => {
    const t = p ? tl.T[p[0]][0] + p[1] : (tl.chapters[0]?.at ?? tl.duration * 0.05) - 0.3;
    console.log(Math.max(0, Math.min(t, tl.duration - 0.1)).toFixed(2));
  });")
exec 9>$S/render.lock
flock -n 9 || { echo "waiting for render.lock (a render is running)"; flock 9; }
ffmpeg -nostdin -y -v error -i $src -map 0:v:0 -map 0:a:0 -vf scale=1280:720:flags=lanczos \
  -c:v libx264 -preset slow -tune animation -profile:v high -level:v 4.0 -pix_fmt yuv420p -crf 23 -maxrate 560k -bufsize 1120k -g 120 -threads 3 \
  -c:a aac -b:a 96k -ac 2 -ar 44100 -movflags +faststart $out.mp4
ffmpeg -nostdin -y -v error -ss $P -i $src -frames:v 1 -vf scale=1280:720:flags=lanczos -q:v 2 $out.jpg
# What came out: size, length, megabytes a minute, and the longest gap between keyframes.
probe() { ffprobe -v error "$@" -of csv=p=0 $out.mp4; }
D=$(probe -show_entries format=duration); B=$(stat -c %s $out.mp4)
vk=$(probe -select_streams v:0 -show_entries stream=bit_rate); ak=$(probe -select_streams a:0 -show_entries stream=bit_rate)
gap=$(probe -select_streams v:0 -skip_frame nokey -show_entries frame=pts_time | awk -v D=$D 'NR > 1 && $1 - p > m { m = $1 - p } { p = $1 } END { if (D - p > m) m = D - p; printf "%.1f", m }')
size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $out.mp4)
echo "$slug/app/$slug$sfx.mp4: $size, $(awk -v b=$B 'BEGIN { printf "%.1f MB", b / 1e6 }'), $(awk -v d=$D 'BEGIN { r = int(d + 0.5); printf "%d:%02d", int(r / 60), r % 60 }'), $(awk -v b=$B -v d=$D 'BEGIN { printf "%.2f MB a minute", b / 1e6 / d * 60 }') (video $((vk / 1000)) kb/s, sound $((ak / 1000)) kb/s), keyframes at most $gap s apart"
echo "$slug/app/$slug$sfx.jpg: $(identify -format '%wx%h' $out.jpg), $(( $(stat -c %s $out.jpg) / 1000 )) KB (the frame at $P s)"
