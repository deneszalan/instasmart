# Brief: a long-form 16:9 explainer video (Reckon)

You make **one** long video, 1920×1080 (16:9), **5–15 minutes**: as long as the story genuinely supports (most land at 8–12 min), never padded. It is a deeper version of one of Reckon's 90-second animations, for watching on a computer or YouTube. Your task message gives the topic, the existing short post, your folder (`<slug>`), the voice and a look.

The studio is `/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio/` (call it `$S`). Work only in `$S/<slug>/`. Never edit the repo (`/home/user/instasmart`), the shared tools in `$S`, or other writers' folders. Never run git commands that change anything. Never put any email address in a request.

## Read first
1. `/home/user/instasmart/content/posts/<field>/<post-id>.json` and `/home/user/instasmart/explainers/<post-id>.js`: the short version (its facts were checked against its `source`). Go far beyond it, but don't contradict it without a source.
2. `/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/longform/script.mjs` and `monty-long.js`: a finished long video (portrait, 6 min), as a model of **structure**: a script of keyed lines, a scene whose every animation is keyed to a line's start or end, title cards for chapters, a credits card. Do not copy its look or its 4:5 layout.
3. `/home/user/instasmart/explainers/kit.js` (drawing helpers: `k.font`, `k.text`, `k.rich` with colour marks, `k.alpha`, `Kit.seg/ease/span/lerp/fmt`) and `/home/user/instasmart/explainers/fonts/README.md` (the font library: choose two families there and load them by name).

## 1. Research and script: `$S/<slug>/script.mjs`
- Read the post's `source` and other reliable pages with WebFetch (prefer en.wikipedia.org; name every page you use in your report). **Facts must be correct and sourced.** Hedge where the source hedges; if you can't confirm something, leave it out. Popular versions of these stories often contain myths: check them.
- `export const LINES = [{ key, text, say?, gap?, chapter? }, …]` and optionally `export const HOLD = { key: seconds }` (extra time after a line, for animation to play out). Keys are short and unique (`o1`, `g3`…).
  - `text` is the subtitle (it goes into the YouTube captions file): one sentence, at most ~22 words, `*marks*`/`~marks~` allowed (they're stripped).
  - `say` is what the voice reads when it differs: write it the way a narrator speaks. No caption style ("…: Simpson's paradox" → "This is called Simpson's paradox"). Spell out symbols and units ("÷" → "divided by", "km/s" → "kilometres a second", "°" → "degrees"), letters as letters ("the letter A", "treatment A"), fractions ("one third").
  - **Numbers:** voices `af_heart`/`af_bella` (Kokoro) read digits well; write thousands with commas (6,174), years as digits. Voices `m1`/`m2` (a cloned narrator) need numbers and years **in words** in `say` ("nineteen seventy-six", "two point four percent").
  - `gap` is the pause before a line (default 0.45 s); give each chapter's first line `chapter: 'Title'` and `gap: 4.2` (its title card plays in that gap). The first line: `gap: 1.0`.
  - Shape: a cold open (a surprising claim or question, under 40 s), a title, **5–9 chapters**, a payoff/recap, and a final line; then the credits card (give the last line a `HOLD` of about 9 s). About 140–160 spoken words per minute of video.
- Comment the facts and their sources at the top of the file, as in the model.

## 2. Timing: `$S/tts.sh <slug>`
Put the voice in `$S/<slug>/voice.txt` (your task says which; if it says `m1`/`m2`, use the stand-in voice it names for now: the cloned voice is recorded later, centrally, and the timeline then shifts automatically because your scene is keyed to lines). `tts.sh` records every line once (waiting for a lock if another writer is recording) and writes `timeline.js` (`window.TL = { duration, T: { key: [start, end] }, chapters: [{ n, title, at }], CUES }`), `subtitles.srt` and `plan.json`. **Finish and fact-check the script before you run it**; re-run it after any change to the lines.

## 3. The scene: `$S/<slug>/scene.js`
```js
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d, e = (key, d = 0) => T[key][1] + d;
Kit.scene({ width: 1920, height: 1080, duration: DURATION, pace: 1, fonts: ['Family A', 'Family B'], draw(t, k) { … } });
```
- Everything is keyed to lines (`s('g3', 0.4)`), never to absolute seconds, so it stays in sync when the timeline is rebuilt. `draw` depends only on `t`.
- **Widescreen layout.** Use the width: diagram on one side and numbers or labels on the other, timelines running left to right, side-by-side comparisons. Margins: keep everything inside x 96–1824, y 72–990; YouTube's controls cover the bottom ~90 px when hovered.
- **No burned-in subtitles** (the captions file covers that). The narration carries the detail; the screen shows the idea: the diagram, the key number, a short label, a heading. On-screen text ≥ 32 px (labels), titles 72–120 px; few words at a time.
- Chapter title cards during each chapter's gap (`CH[i].at` → `+3.9 s`), parts that crossfade under them (see `monty-long.js` `draw()`), a cold-open title, and a **credits card** at the end: the title, "Reckon · original animation", the music credit lines, the sources. Don't mention AI anywhere.
- **Show, don't tell**; compute numbers in code (run the simulation, the geometry), so picture, narration and source agree. Ease everything, crossfade, nothing jumps. No realistic people (simple shapes, silhouettes, icons are fine); caption simplified drawings (maps, machines, orbits not to scale) as diagrams.
- **A distinct, designed look** (your task gives a direction): a textured or deep background, a consistent palette, two font families from the library. Paint static backgrounds once into an offscreen canvas of 1920×1080.

## 4. Check it
- `node $S/render.mjs preview <slug> t1,t2,…` writes PNG stills to `$S/<slug>/prev/` and lists any character drawn from the fallback font (`NO FONT` must never appear). Check a still at **every line's midpoint** (read the times from `timeline.js`) plus the title cards and the credits; combine them with `montage $(ls $S/<slug>/prev/*.png) -tile 4x -geometry 480x270+3+3 sheet.png` and look at the sheets. Fix overlaps, clipped text, crowding, contrast, anything off-screen. Two or three rounds.
- Do **not** run `render-video.sh` (the final render is done centrally, one video at a time).

## 5. Music: `$S/<slug>/music.json`
`node /tmp/claude-0/-home-user-instasmart/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/video-posts/tools/music-find.mjs --feel <moods> [--q words] [--min 180]` searches Kevin MacLeod's catalogue (CC BY 4.0); `bash …/tools/music-get.sh "<file name>"` downloads it and prints its path and credit line. Choose by mood, tempo, instruments and description; you can't listen. Use 1–3 tracks; change track only at a chapter card. **Claim each track** by appending `<slug> | <file name>` to `$S/music-claims.txt` right away; no track may be used twice across the videos (and not "Happy Happy Game Show" or "Half Mystery"). `music.json`: `[{ "file": "<path>", "at": <video s>, "until": <video s>, "offset": <s into the track> }]` covering 0 → `duration`, consecutive segments overlapping ~3 s under a title card. A track must be long enough for its segment (offset + length ≤ track length). Put the credit lines on the credits card exactly as music-get printed them.

## Report when done (compact, ~250 words)
Slug, length, chapters (titles), voice, the music (credit lines), the look (palette, fonts, motif), the key facts with their source URLs, anything you left out or weren't sure about, and the times of 3 stills that best show the video.

## Then: the dialogue version
Every video also gets a dialogue version, in which two narrators talk the story through. When the monologue version is finished and checked, read `$S/DIALOGUE.md` and make it (your task names the cast), then send one report covering both.
