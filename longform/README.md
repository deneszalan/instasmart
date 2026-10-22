# Long-form videos (work in progress)

Long 16:9, 1080p versions of Reckon's animations, 5–15 minutes each, for watching on a computer or YouTube. Each video comes in two versions: one narrator, and a dialogue in which two narrators talk the story through (`<slug>-dialogue/`, which shares its scene with `<slug>/`).

This folder is a saved copy of the studio the videos are made in. The tools still use the studio's own paths. Recordings, renders, stills and downloaded research pages are left out because they can all be made again.

- `BRIEF.md`, `DIALOGUE.md`: what a video's writer does.
- `<slug>/script.mjs`: the narration as keyed lines, with its sources. `scene.js`: the animation, keyed to those lines. `timeline.js`, `subtitles.srt`, `plan.json`: the timing measured from the recorded voice. `music.json`: the soundtrack plan. `voice.txt`: the voice or the cast.
- `tts.sh` records the lines and runs `timing.mjs`. `render.mjs` draws stills or video. `render-video.sh` renders a video, then `assemble.py` builds the speech track and `mix.py` mixes it with the music. `music-remap.mjs` moves a monologue's music plan onto its dialogue's timeline.
- `page.html` loads `kit.js` and `fonts/` from `explainers/`.
