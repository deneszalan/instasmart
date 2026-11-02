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
- **Write for the ear.** The voice reads exactly what `say` (else `text`) says, and it does not pause for a full stop or a colon between numbers. So:
  - Give every result its connecting words: "23 times 22, divided by 2, **is** 253", "**that gives** 253 pairs", "**which makes** 7.2 degrees". Never "…divided by 2. 253 pairs." or "…stadia: 250,000 stadia".
  - No caption-style colons in what is spoken. Say "the chance is 50.7 percent", not "more likely than not: 50.7 percent"; "With 10 guests, the chance is 11.7 percent; with 30, it's 70.6 percent", not "10 guests: 11.7 percent. 30 guests: 70.6 percent."
  - Every spoken sentence has a verb (short replies such as "Exactly." are fine). Two numbers never meet across a full stop or a comma.
  - `text` (the captions) should match the speech closely; it may keep digits and symbols.
  - Check with `node $S/speak-lint.mjs <slug>` (`VERBOSE=1` lists the lines); fix every flag or be sure it reads naturally aloud.

## 2. Timing: `$S/tts.sh <slug>`
Put the voice in `$S/<slug>/voice.txt` (your task says which; if it says `m1`/`m2`, use the stand-in voice it names for now: the cloned voice is recorded later, centrally, and the timeline then shifts automatically because your scene is keyed to lines). `tts.sh` records every line once (waiting for a lock if another writer is recording; it keeps every line it has recorded, so a re-run records only new or reworded lines) and writes `timeline.js` (`window.TL = { duration, T: { key: [start, end] }, chapters: [{ n, title, at }], CUES }`), `subtitles.srt` and `plan.json`. **Finish and fact-check the script before you run it**; re-run it after any change to the lines.

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
- If your task asks for a French version, read section 6 before you write the scene: the same scene plays both languages.

## 4. Check it
- `node $S/render.mjs preview <slug> t1,t2,…` writes PNG stills to `$S/<slug>/prev/` and lists any character drawn from the fallback font (`NO FONT` must never appear). Check a still at **every line's midpoint** (read the times from `timeline.js`) plus the title cards and the credits; combine them with `montage $(ls $S/<slug>/prev/*.png) -tile 4x -geometry 480x270+3+3 sheet.png` and look at the sheets. Fix overlaps, clipped text, crowding, contrast, anything off-screen. Two or three rounds.
- Do **not** run `render-video.sh` (the final render is done centrally, one video at a time).

## 5. Music: `$S/<slug>/music.json`
`node /tmp/claude-0/-home-user-instasmart/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/video-posts/tools/music-find.mjs --feel <moods> [--q words] [--min 180]` searches Kevin MacLeod's catalogue (CC BY 4.0); `bash …/tools/music-get.sh "<file name>"` downloads it and prints its path and credit line. Choose by mood, tempo, instruments and description; you can't listen. Use 1–3 tracks; change track only at a chapter card. **Claim each track** by appending `<slug> | <file name>` to `$S/music-claims.txt` right away; no track may be used twice across the videos (and not "Happy Happy Game Show" or "Half Mystery"). `music.json`: `[{ "file": "<path>", "at": <video s>, "until": <video s>, "offset": <s into the track> }]` covering 0 → `duration`, consecutive segments overlapping ~3 s under a title card. A track must be long enough for its segment (offset + length ≤ track length). Put the credit lines on the credits card exactly as music-get printed them.

## 6. The French version (when your task asks for one)
The French video shares your scene. Its voice is XTTS-v2 (speaker Ana Florence), and it gets its own timeline from that voice. Your scene is keyed to line keys, so it plays to the French timing unchanged, and kit.js swaps every string it draws for the French in `labels-fr.json`. Start the French once the English script, scene and stills are final. `$S/test-fr/` is a small finished example. "French version" in `$S/README.md` has the details.
1. **`FR` in `script.mjs`.** Export `FR = { <key>: { text, say? } }` with every key of `LINES`. Write natural French as a French narrator would say it, not a word-for-word translation, but keep the same facts and hedges. Each line must still say what the screen shows at that line, because the animation is keyed to it.
   - `text` is the subtitle. Use French typography: ’, « », a narrow no-break space before ? ! ; :, 1 250 000, and a decimal comma (2,4).
   - `say` is what the voice reads, where it differs. Numbers and years go in words ("mille neuf cent quarante-trois", "deux virgule quatre pour cent"), and so do symbols and units ("kilomètres", "degrés"). Leave off the final full stop.
   - "Write for the ear" applies in French too: the connecting words, a verb in every sentence, no caption-style colons.
   - Keep each line under about 200 characters. XTTS is less steady on long lines, and it cuts a French line after 273.
   - French runs 10–25% longer than English. If an animation needs a different hold after a French line, set `HOLD_FR = { <key>: seconds }`; any key it doesn't name keeps its `HOLD` value.
2. **`$S/<slug>/labels-fr.json`**: `{ "labels": { "<English, exactly as drawn>": "<French>" } }`, for every string with words that the scene draws.
   - Write chapter titles as the scene draws them, e.g. `"THE MARETH LINE"` after `.toUpperCase()` and `"PART 2"`; the timeline keeps the English titles for this.
   - Include the headings and lines of the credits card. A name or credit line that stays the same maps to itself.
   - Only whole strings are swapped. Draw words and numbers as separate strings (`fmt(n)`, then `'stadia'`), not `` `${fmt(n)} stadia` ``.
   - Kit.fmt writes whole numbers the French way (`1 250 000`). For a decimal, use `x.toLocaleString(window.TR?.locale ?? 'en-US', { maximumFractionDigits: 1 })`; `toFixed()` writes 7.2 in French too.
   - In labels, use the ordinary no-break space (U+00A0) where French puts one, as in `« Titre »` or `Pourquoi ?`. Most families in the library lack the narrow one (U+202F), and the browser draws it almost without width.
3. **`bash $S/tts-fr.sh <slug>`** records every French line once.
   - Only one XTTS process may run on this machine, so it waits for `xtts.lock` if another is recording. XTTS is slow: on a busy machine, allow a few minutes a line.
   - It keeps every line it has recorded, so a re-run records only new or reworded lines.
   - Each take is checked with French speech recognition, with up to four takes a line. At the end it lists any line that still sounds wrong: words not heard, more said after the last word, a statement ending on a rising tone, a rushed or drawn-out pace. `rec-fr/report.txt` shows what was heard for every line. Reword a flagged line in `FR` (or spell a name in `say` the way it's said) and run the script again.
   - It also builds the French timeline (`timeline-fr.js`, `subtitles-fr.srt`, `plan-fr.json`) with `node $S/timing.mjs build-fr <slug>`. Run that alone after changing only `HOLD_FR`.
   - Then it checks that your music fits the longer French timeline. If it prints `TOO SHORT`, change `music.json` so that every segment fits both timelines.
4. **Preview the French**: `node $S/render.mjs preview <slug> t1,t2,… fr` writes `$S/<slug>/prev-fr/`. Read the times from `timeline-fr.js`: every line's midpoint, the title cards, the credits.
   - Give every string it lists as "drawn in English" its label.
   - Look at the sheets for French text that overflows, overlaps or crowds. French is often 20–30% longer. The fix must work in both languages, because the scene is shared: shorten the French, or let the layout measure the text (a chip as wide as `ctx.measureText()`, a title whose size steps down until it fits).
   - Check the font list as for the English. `NO FONT` must never appear.
5. Do **not** run `render-video.sh` or `app.sh`. The final renders run centrally, one at a time: `render-video.sh <slug> fr` makes `<slug>-fr.mp4`, and `app.sh <slug> fr` makes the phone app's copy.

## Report when done (compact, ~250 words)
Slug, length, chapters (titles), voice, the music (credit lines), the look (palette, fonts, motif), the key facts with their source URLs, anything you left out or weren't sure about, and the times of 3 stills that best show the video. With a French version: its length, and any line the recognition still flags.

## Then: the dialogue version
Every video also gets a dialogue version, in which two narrators talk the story through. When the monologue version is finished and checked, read `$S/DIALOGUE.md` and make it (your task names the cast), then send one report covering both.
