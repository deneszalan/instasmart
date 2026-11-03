"""The phone app's subtitles for a finished film: python3 -I vtt.py <slug> [fr]
<slug>/subtitles[-fr].srt -> <slug>/app/<slug>[-fr].vtt (WebVTT, the same cues and times as the film's narration)."""
import re, sys
S = '/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio'
slug = sys.argv[1]; sfx = '-fr' if sys.argv[2:] == ['fr'] else ''
srt = open(f'{S}/{slug}/subtitles{sfx}.srt', encoding='utf-8').read().replace('\r', '')
out = ['WEBVTT', '']
for block in [b for b in srt.strip().split('\n\n') if b.strip()]:
    lines = block.split('\n')
    times = next(l for l in lines if '-->' in l)
    text = lines[lines.index(times) + 1:]
    out += [re.sub(r'(\d\d:\d\d:\d\d),(\d\d\d)', r'\1.\2', times), *text, '']
open(f'{S}/{slug}/app/{slug}{sfx}.vtt', 'w', encoding='utf-8').write('\n'.join(out))
print(f'{slug}/app/{slug}{sfx}.vtt: {sum(1 for l in out if "-->" in l)} cues')
