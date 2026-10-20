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
2. Check the layout with stills: `npm run explainer -- <post-id> --preview 2,9.5,20`.
3. Render it with music:
   ```
   npm run explainer -- <post-id> --name <name> --music track.mp3 --still 6.5
   ```
   This writes `content/media/<post-id>/<name>.mp4` and `<name>.jpg`, checks both and prints the slide JSON. It needs ffmpeg and Chromium (set `CHROMIUM_PATH`, or run `npx playwright-core install chromium` once).
4. Add the slide to the post with `"fit": "cover"`, `"animation": true` (Explore lists it under "Animation"), `"credit": "Reckon · original animation"` and the `music` credit, then run `npm run content`.

## Rules

- **Facts come from the post's source.** Compute numbers in the scene (the binary search really runs the search) so the picture, captions and source agree. Hedge where the source hedges.
- **Captions carry the story**: clips start muted, so every step needs a short caption. Mark key words with `*…*` or `~…~` and give each mark a colour.
- **Vary the look.** Each explainer gets its own palette, type and visual motif; don't reuse one scene's colours and layout for the next. Use only fonts you may bundle (SIL Open Font License or similar), and add the font's licence file next to it in `fonts/`.
- **Format:** 864×1080 (4:5), up to 60 s and 3 MB. Give the slide `"fit": "cover"`: the clip then fills the card, with the slide counter over the top-right corner and a slim control strip (sound, seek bar, credits) over the bottom. So keep every caption and important element above y = 930, with caption blocks around y = 820–840, and keep the top-right corner (x > 740, y < 120) empty. Keep text large: at least 40 px for captions and 22 px for labels.
- **Match the post to the animation.** Give the post a `"theme": { "gradient": [c1, c2] }` taken from the animation's palette, so its other slides share the look. The slides draw white text on the gradient, so for a light animation (paper, parchment) use its darker ink and accent colours, and keep white text at a contrast of at least 4.5:1.
- **Guess before you watch.** If the video gives away the answer to a guessing slide in the same post, put that slide before the video.
- **The still must not give the result away**: pick `--still` at the hook or the question.
- **Music** follows the same rules as for clips: a reusable track (Kevin MacLeod's incompetech.com catalogue is CC BY 4.0), credited in `music`.
