# Brief: the dialogue version of a long-form video

Each long video also gets a **dialogue version**: the same pictures, but two narrators talk the story through and reflect to each other instead of one narrator telling it. You write it after the monologue version (BRIEF.md) is finished and checked, because it reuses that version's scene. `$S` is `/tmp/claude-0/-home-user/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/studio/`.

## The folder: `$S/<slug>-dialogue/`
- `script.mjs`: the dialogue (below).
- `voice.txt`: the cast, one line, e.g. `A=am_michael B=af_bella`. Speaker **A** is the male voice and **B** the female voice your task names. While you write, A's final voice (`m1`/`m2`, recorded later, centrally) is stood in for by `am_michael`; B's voice is final.
- `scene.js`: `ln -s ../<slug>/scene.js scene.js`. Both versions share one scene, so its credits card, music credits and pictures stay identical. Don't change `scene.js` unless you must; if you do, re-check the monologue version's stills too.
- `music.json`: `node $S/music-remap.mjs <slug>` writes it after you run tts.sh, moving every music change to the same chapter card in the dialogue timeline. If it prints `TOO SHORT`, edit the dialogue's `music.json`: switch tracks at a different chapter card, start a track earlier (`offset`), or bring back one of the video's own tracks at a later chapter card. Use only the monologue's tracks (the credits card is shared) and don't add claims.

## The dialogue: `script.mjs`
- Same format as the monologue, plus `who: 'A'` or `who: 'B'` on **every** line. `text`, `say`, `gap`, `chapter` and `HOLD` work as in BRIEF.md. The captions file marks each change of speaker with `>>` by itself.
- **The scene is keyed to the monologue's keys, so every key of the monologue's `LINES` must appear in the dialogue, in the same order, on a line that carries the same beat** (what's on screen at that moment). Reword it freely for conversation and give it to either speaker. New lines in between get new keys (`x1`, `x2`, …). Keep the same chapters on the same keys (`chapter: 'Title'`, `gap: 4.2`), `gap: 1.0` on the first line, and the monologue's `HOLD`s. If the scene starts something partway through a line (`s('g3', 2.5)`), keep that line at least that long.
- **Two people thinking together, not a lecture split in two.** Both know the subject and both are curious. They take turns carrying the explanation, ask the question a viewer would ask at that moment, react ("Wait, only twenty-three?"), put an idea into their own words, push back, connect it to something earlier, and now and then stop to reflect on what it means and why it surprises people. Most turns are one to three lines; a line is still one sentence of at most ~22 words. Spoken, natural English with contractions. Vary who explains: B is not only the one who asks.
- They don't use names, don't invent personal memories or experiences ("when I was a kid…"), and don't mention AI. Every fact is still correct and sourced (the monologue's research), and the dialogue adds no new claim without a source.
- **Numbers:** A's lines are spoken by the cloned voice, so A's `say` writes numbers and years in words; B's lines (Kokoro) may use digits, with commas in thousands.
- Gaps: the default 0.45 s suits most turns; a quick reaction can take `gap: 0.3`, a reflective pause `0.8`.
- Length: the dialogue runs longer than the monologue (aim for at most a third longer), and stays within 5–15 minutes.

## Timing, checks, report
- `bash $S/tts.sh <slug>-dialogue` records it (the `>>` captions, `timeline.js` and `plan.json` come out as before), then `node $S/music-remap.mjs <slug>`.
- `node $S/render.mjs preview <slug>-dialogue t1,t2,…`: check a still at every line's midpoint in the dialogue timeline, the title cards and the credits, as in BRIEF.md. Animations must still land on the line they belong to.
- Don't run `render-video.sh`.
- Add to your report: the dialogue's length, how many lines and turns, how A and B share the telling, and 2–3 exchanges you're happy with (quote them).
