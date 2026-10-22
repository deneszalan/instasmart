# Animated explainers

An explainer is a short animation, drawn by code, that walks through one post's idea: a hook question, a demonstration, then why it works. It becomes a `video` slide like any clip (see "Video clips" in `content/README.md`).

```
explainers/
  kit.js                                    shared helpers: easing, text, captions, scene setup
  page.html                                 loads kit.js and one scene
  fonts/                                    bundled fonts, each with its licence (OFL)
  tech-binary-search-twenty-guesses.js      one scene per post, named after the post id
```

## Make one

1. Write `explainers/<post-id>.js`. It calls `Kit.scene({ width, height, duration, fonts, draw })`; `draw(t, k)` paints the frame at `t` seconds on a canvas, and must depend on nothing but `t`. Start from an existing scene.
   **Pace:** the clip plays the scene at 75% speed (`pace: 0.75` is the default), so readers have time to read and watch: a 60 s scene becomes an 80 s clip. Write all times (the duration, `t`, caption cues, `--preview` and `--still`) in scene seconds. Clips may last up to 90 s, so keep scenes to 67.5 s.
2. Check the layout with stills: `npm run explainer -- <post-id> --preview 2,9.5,20`.
3. Render it with music:
   ```
   npm run explainer -- <post-id> --name <name> --music track.mp3 --still 6.5
   ```
   This writes `content/media/<post-id>/<name>.mp4` and `<name>.jpg` (in the post's own app, e.g. `editions/lesefutter/content/media/`; for a post not written yet, add `--edition lesefutter`), checks both and prints the slide JSON. It needs ffmpeg and Chromium (set `CHROMIUM_PATH`, or run `npx playwright-core install chromium` once).
4. Add the slide to the post with `"fit": "cover"`, `"animation": true` (Explore lists it under "Animation"), `"credit": "Reckon · original animation"` and the `music` credit, then run `npm run content`.

**Steps.** Each caption is one step of the clip: readers can jump between steps (with buttons, or by tapping the clip's left or right edge) and choose to pause after each one. The render writes the steps into the post's slide for that clip (or prints them in the slide JSON), and puts keyframes where the player jumps to (0.3 s before each step ends, where a paused clip shows it, and close before each start), with more in between so that none are over 4 s apart; jumping and dragging then show the picture at once. After changing a scene's caption timings without rendering again, `npm run explainer -- <post-id> --steps` rewrites them, but render again too, so the keyframes move with them. Captions drawn with `k.captions` are picked up automatically; a scene that draws its own captions should keep their timings in a top-level `const CUES = [[start, end, text], …]`.

**Fixing a scene later.** `npm run explainer -- <post-id> --name <name> --keep-sound --still <s>` renders the picture again and keeps the clip's soundtrack exactly as it is. Give the same `--still` as before, or the poster changes.

**Narration.** A voice can read the captions over the music. `npm run explainer -- <post-id> --srt captions.srt` writes the scene's captions as subtitles timed to the clip, without the marks. Edit them into words a voice reads well (spell out "50/50", "km/s", "°" and years), then make a speech track that says each line at its time, e.g. with srt2speech. `npm run explainer -- <post-id> --name <name> --narration speech.wav` mixes it into the clip: it measures both tracks, sets the voice to −16 LUFS and the music 12 LU below it (`--music-gap`), dipping further while the voice speaks, so every voice comes out equally clear. The picture stays exactly as it is. It adds to whatever sound the clip has, so run it once, on the clip with music only. The slide's credit stays `"Reckon · original animation"`.

## Rules

- **Facts come from the post's source.** Compute numbers in the scene (the binary search really runs the search) so the picture, captions and source agree. Hedge where the source hedges.
- **Captions carry the story**: clips start muted, so every step needs a short caption, shown long enough to read. Mark key words with `*…*` or `~…~` and give each mark a colour.
- **Vary the look.** Each explainer gets its own palette, type and visual motif; don't reuse one scene's colours and layout for the next. Use only fonts you may bundle (SIL Open Font License or similar), and add the font's licence file next to it in `fonts/`.
- **Format:** 864×1080 (4:5), a clip of up to 90 s and 5.4 MB (3 MB, or 60 kB a second if that is more). Give the slide `"fit": "cover"`: the clip then fills the card, with the slide counter over the top-right corner and a slim control strip (sound, seek bar, credits) over the bottom. So keep every caption and important element above y = 930, with caption blocks around y = 820–840, and keep the top-right corner (x > 740, y < 120) empty. Keep text large: at least 40 px for captions and 22 px for labels.
- **Match the post to the animation.** Give the post a `"theme": { "gradient": [c1, c2] }` taken from the animation's palette, so its other slides share the look. The slides draw white text on the gradient, so for a light animation (paper, parchment) use its darker ink and accent colours, and keep white text at a contrast of at least 4.5:1.
- **Guess before you watch.** If the video gives away the answer to a guessing slide in the same post, put that slide before the video.
- **The still must not give the result away**: pick `--still` at the hook or the question.
- **Music** follows the same rules as for clips: a reusable track (Kevin MacLeod's incompetech.com catalogue is CC BY 4.0), credited in `music`.

## Later: interactive explainers

Planned, not built yet. Instead of a rendered MP4, the app would run the scene itself (the same `Kit.scene` `draw(t, k)` code) on a canvas in the slide. Then readers could scrub frame-perfectly at any speed, step through it, and change the inputs: pick the secret number in the binary search, switch doors in Monty Hall, or set the test's accuracy in the base-rate scene. It needs a way to load scene code safely in the app, a fallback video for old phones, and controls that the scene declares.
