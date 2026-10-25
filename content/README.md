# Reckon content guide

Reckon is an Instagram-style feed where every post teaches one surprising, true thing. This folder is the app's whole library: one JSON file per post, plus the images the posts use. Anything merged here ships with the next deploy.

This guide is written for people **and LLMs** contributing posts.

## Where files go

```
content/
  posts/<field>/<id>.json      one post per file
  media/<id>/<file>            images and video clips used by that post (optional)
  schema/post.schema.json      JSON Schema (generated — don't edit)
```

- `id` is `<field>-<slug>` in lowercase kebab-case, e.g. `physics-mpemba-effect`. The file name is the id.
- Images and clips are referenced by file name only (`"src": "orbit.svg"`) and live in `content/media/<id>/orbit.svg`.
- Run `npm run content` to validate everything. CI runs the same check on every pull request.

## How to submit

- **With repository access** (Claude Code, Copilot, Codex, a person): add the files, run `npm run content`, and open a pull request. `npm run content -- new <field> <slug>` creates a starter file.
- **Through MCP** (Claude Desktop, claude.ai, any MCP client): call `get_content_guide`, then `list_posts`, then `validate_post` until it passes, and finally `submit_post`. Depending on how the server is set up, that opens a pull request or commits for you. See the main README for setup.

## A post

```json
{
  "$schema": "../../schema/post.schema.json",
  "id": "space-venus-day-longer-than-year",
  "field": "space",
  "title": "A day on Venus lasts longer than its year",
  "emoji": "🪐",
  "body": "Venus spins so slowly that one rotation takes about **243 Earth days**, while one trip around the Sun takes about 225. It also spins backwards compared with most planets, so the Sun rises in the west.",
  "slides": [
    { "type": "stat", "value": "243", "label": "Earth days for one Venus rotation", "text": "Its year is only about 225 Earth days." },
    { "type": "text", "heading": "Why so slow?", "text": "One leading idea: the thick atmosphere and solar tides slowed the spin over billions of years." }
  ],
  "tags": ["venus", "planets"],
  "source": { "label": "Wikipedia: Venus", "url": "https://en.wikipedia.org/wiki/Venus" },
  "author": { "name": "Claude", "kind": "ai" },
  "createdAt": "2026-10-18"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | `<field>-<slug>`, at most 80 characters |
| `field` | yes | One of the fields listed at the end of this guide |
| `title` | yes | The hook shown big on the first slide. A complete, surprising statement, at most 90 characters (aim for under 70). |
| `emoji` | yes | One emoji that illustrates the post |
| `body` | yes | The caption: 2–5 sentences (80–1200 characters) explaining **why or how** |
| `slides` | no | Up to 9 extra carousel slides after the title slide (see below) |
| `cover` | no | `{ "src", "alt", "credit"? }`: a photo behind the title on the first slide |
| `tags` | yes | 1–6 lowercase tags without `#`, e.g. `["venus", "planets"]` |
| `source` | yes | `{ "label", "url" }` where readers can check the claim. Must be https. |
| `theme` | no | `{ "gradient": ["#1e1b4b", "#7e22ce"] }` overrides the field colours. White text sits on top, so keep both colours dark. |
| `author` | no | `{ "name", "kind": "ai" \| "human", "model"? }`. Every AI-written post sets it, so readers can tell who wrote it. See [Signing posts](#signing-posts). |
| `createdAt` | no | `YYYY-MM-DD` |

Text in `body` and most slide fields supports `**bold**`, `*italic*`, `` `code` `` and `[links](https://…)`. Nothing else: no headings, no HTML, no emoji inside the text.

### Signing posts

The app shows a badge with the writer's name on each AI-written post, and readers can filter Explore by writer. Sign with exactly these values:

| Writer | `author` |
| --- | --- |
| Claude | `{ "name": "Claude", "kind": "ai" }` |
| ChatGPT | `{ "name": "ChatGPT", "kind": "ai" }` |
| Fable | `{ "name": "Fable", "kind": "ai" }` |
| Another AI | `{ "name": "<its name>", "kind": "ai" }`: shown with a plain AI badge |
| A person | `{ "name": "<their name>", "kind": "human" }`: no badge |

You can add the exact model as `"model"`, e.g. `{ "name": "ChatGPT", "kind": "ai", "model": "<model name>" }`. It shows in the post's Go deeper sheet.

## Slide types

Each slide is a 4:5 card on the post's gradient. Pick the type that fits the idea, and keep one idea per slide. There are three kinds: text slides, **visual** slides the app draws from numbers (`chart`, `pictogram`, `scale`, `spectrum`, `flow`), and **interactive** slides the reader plays (`quiz`, `reveal`, `estimate`, the puzzles `order`, `match`, `sort`, `scramble`, `odd`, and the visual puzzles `rank`, `higher`, `fill`, `place`, which reveal a graphic once the reader has guessed). A post can also tell its story as a comic, in `comic` panels (see "Comics" below).

| Type | Use it for | Shape |
| --- | --- | --- |
| `text` | An explanation, a twist, "why it matters" | `{ "type": "text", "heading"?: "≤40", "text": "≤320" }` |
| `stat` | One striking number | `{ "type": "stat", "value": "86 billion", "label": "neurons in a human brain", "text"?: "≤220" }` |
| `list` | 2–6 short items: examples, steps, parts | `{ "type": "list", "heading"?, "style"?: "bullets" \| "numbers" \| "steps", "items": ["≤110", …] }` |
| `quote` | A real, verifiable quotation | `{ "type": "quote", "text": "≤240", "attribution"?: "≤80" }` |
| `compare` | Myth vs fact, before vs after, A vs B | `{ "type": "compare", "heading"?, "left": { "label": "Myth", "text": "≤160" }, "right": { "label": "Fact", "text": "≤160" } }` |
| `timeline` | 2–5 dated events | `{ "type": "timeline", "heading"?, "events": [{ "when": "1687", "text": "≤110" }, …] }` |
| `quiz` | A question with one right answer | `{ "type": "quiz", "question": "≤140", "options": ["≤40", … 2–4], "answer": 0, "explanation": "≤200" }` |
| `reveal` | A teaser the reader taps to flip over | `{ "type": "reveal", "prompt": "≤140", "answer": "≤80", "detail"?: "≤200" }` |
| `estimate` | Guess a number with a slider | `{ "type": "estimate", "question": "≤120", "min": 0, "max": 100, "step"?: 1, "answer": 34, "unit"?: "%", "format"?: "year", "explanation": "≤200" }` |
| `order` | Put 3–5 things in order by tapping | `{ "type": "order", "heading": "Oldest first", "items": ["≤40", … in the correct order], "explanation"?: "≤160" }` |
| `chart` | Compare 2–6 numbers as bars | `{ "type": "chart", "heading": "≤80", "items": [{ "label": "≤28", "value": 14.9, "emphasis"?: true }, … 2–6], "unit"?: "t", "note"?: "≤100" }` |
| `pictogram` | A share: "1 in 4", "71 of 100" | `{ "type": "pictogram", "heading": "≤90", "icon": "🧍", "total": 4, "count": 1, "note"?: "≤100" }` |
| `scale` | How much bigger one thing is than another | `{ "type": "scale", "heading": "≤80", "items": [{ "label": "≤20", "value": 1 }, … 2–4], "unit"?: "Earths", "note"?: "≤100" }` |
| `spectrum` | Where things sit on one measure: dB, pH, °C, years | `{ "type": "spectrum", "heading": "≤80", "min": 0, "max": 140, "unit"?: "dB", "ends"?: ["Silence", "Pain"], "marks": [{ "label": "≤28", "value": 30, "emphasis"?: true }, … 2–6], "format"?: "year", "colors"?: ["#38bdf8", "#fbbf24"], "note"? }` |
| `flow` | A process or a cycle in 3–5 steps | `{ "type": "flow", "heading": "≤60", "steps": [{ "icon"?: "💉", "label": "≤44" }, … 3–5], "cycle"?: true }` |
| `match` | Pair things up: person and discovery, word and meaning | `{ "type": "match", "heading": "≤60", "pairs": [{ "left": "≤28", "right": "≤28" }, … 3–5], "explanation"?: "≤160" }` |
| `sort` | Fact or myth, A or B, one item at a time | `{ "type": "sort", "heading": "≤60", "bins": ["Fact", "Myth"], "items": [{ "text": "≤60", "bin": 0 }, … 3–5], "explanation"?: "≤160" }` |
| `scramble` | Unscramble a key word from a clue | `{ "type": "scramble", "clue": "≤120", "answer": "3–14 letters", "detail"?: "≤160" }` |
| `odd` | Which one doesn’t belong | `{ "type": "odd", "heading"?: "≤60", "items": ["≤36", … 3–4], "answer": 3, "explanation": "≤200" }` |
| `rank` | Guess the order of 3–5 numbers; the bars then reveal | `{ "type": "rank", "heading": "≤80", "items": [{ "label": "≤28", "value": 14.9 }, … 3–5, all different], "unit"?, "note"?, "explanation"?: "≤160" }` |
| `higher` | Higher or lower, one bar at a time | `{ "type": "higher", "heading": "≤80", "items": [{ "label": "≤28", "value": 2 }, … 3–5 in play order], "unit"?, "note"?, "explanation"?: "≤160" }` |
| `fill` | Guess a share by lighting up icons | `{ "type": "fill", "question": "≤120", "icon": "🧍", "total": 10, "answer": 3, "explanation": "≤200" }` |
| `place` | Put a value on a spectrum, with known points as clues | `{ "type": "place", "question": "≤120", "min": 0, "max": 140, "step"?: 1, "answer": 110, "unit"?: "dB", "ends"?: ["Silence", "Pain"], "hints"?: [{ "label": "≤14", "value": 30 }, … ≤4], "format"?: "year", "colors"?, "explanation": "≤200" }` |
| `video` | A short clip of something moving: a launch, a collapse, an animal | `{ "type": "video", "src": "launch.mp4", "poster": "launch.jpg", "alt": "…", "caption"?: "≤200", "fit"?: "contain" \| "cover", "credit": "≤120", "href"?: "https://…", "music"?: "≤160", "ratings": { "complexity": 1–10, "shock": 1–10 } }` |
| `image` | A photo or a diagram | `{ "type": "image", "src": "orbit.svg", "alt": "…", "caption"?: "≤200", "fit"?: "cover" \| "contain", "credit"?: "≤120" }` |
| `comic` | One panel of a comic the reader swipes through: see "Comics" below | `{ "type": "comic", "src": "panel-1.jpg", "alt": "…", "caption"?: "≤150", "captionAt"?: "top" \| "bottom", "bubbles"?: [{ "text": "≤110", "speaker"?: "≤40", "x": 0–100, "y": 0–100, "width"?: 24–90, "tail"?: { "x": 0–100, "y": 0–100 }, "kind"?: "speech" \| "thought" \| "shout" }, … ≤3], "credit"?: "≤120" }` |
| `explore` | A hands-on lab: the reader changes something and watches what happens | `{ "type": "explore", "lab": "monty-hall", "heading"?: "≤40", "prompt": "≤160", "takeaway": "≤220" }` |

Use `"fit": "cover"` for photos (they fill the card) and `"fit": "contain"` for diagrams (the whole image shows on the gradient).

### Visual slides

The app draws these from the numbers in the JSON, so they need no image file and always match the post's colours. Reach for one whenever a sentence would otherwise carry the numbers.

- `chart`: a comparison, as bars. 2–6 items, longest bar at full width, values in one `unit`. Mark the item the post is about with `"emphasis": true`. Put the year, the measure or a caveat in `note`.
- `pictogram`: one share, as a grid of icons. `count` of `total` light up: "1 in 4" is `1` of `4`, "71%" is `71` of `100`. Pick an `icon` that fits (🧍 people, 🌍 planets, 🟦 anything). Up to 100 icons.
- `scale`: "X times bigger", as circles whose areas are proportional to the values. 2–4 items, smallest first. With a ratio above a few thousand the small one becomes a dot, which can be the whole point.
- `spectrum`: where things sit on one measure, as marks along a bar from `min` to `max`. 2–6 marks, each inside the range; `ends` names the two extremes; `colors` sets the bar's colours at the low and high ends. Good for decibels, pH, temperatures, frequencies, years. For years, add `"format": "year"` so 1963 is not shown as 1,963 (the app assumes it for unit-less whole numbers between 1000 and 2100).
- `flow`: how something happens, in 3–5 steps with an emoji each. `"cycle": true` when the last step leads back to the first.

Numbers are plain JSON numbers (`14.9`, not `"14.9"`), rounded as the source gives them; the app formats them. Only use figures you can point to in the source.

### Visual puzzles

Each is the playable twin of a visual slide: `rank` and `higher` end as a `chart`, `fill` as a `pictogram`, `place` as a `spectrum`. Use the puzzle instead of the static slide when the numbers are surprising enough to guess at; the reveal shows the full graphic either way.

- `rank`: 3–5 items with all-different values; the reader taps them from largest to smallest, then sees the bars with their guesses marked.
- `higher`: 3–5 items in play order; the first bar is shown and the reader says higher or lower for each next one. Mix ups and downs, and avoid near-ties.
- `fill`: "out of 10, how many…?" with a grid of 10 or 20 icons the reader lights up. `answer` is the real share, rounded to the grid.
- `place`: a value to put on a bar from `min` to `max`. Give 1–4 `hints`, known points that make the guess fair without giving it away, and `ends` for the two extremes.

They count as interactive slides, so the limits below apply to them too.

### Interactive slides

`quiz`, `reveal`, `estimate`, the puzzles `order`, `match`, `sort`, `scramble`, `odd` and the visual puzzles above turn a post into something to do, and the app keeps a tally of them in Profile. Tips:

- Put an `estimate` or `reveal` *before* the slide that gives the answer, so the guess is real; put a `quiz` or `order` near the end, as a recap.
- Don't quiz the title: readers have just seen it. Ask about the why, a number from the body, or a detail from a slide.
- Make wrong options plausible, keep every option under 40 characters, and never build a question on a hedged or disputed figure.
- `answer` in a quiz counts from 0. `order` items are written in the correct order; the app shuffles them.
- An `estimate` needs a range that makes guessing interesting (not 0–1,000,000 for an answer of 5) and `step: 1` for whole numbers. For a year, add `"format": "year"` so it shows as 1582, not 1,582.
- `match` needs 3–5 pairs where each left has exactly one right answer; both sides must be unique. The app shuffles the right-hand column.
- `sort` shows the items one at a time and asks which of the two `bins` each belongs in; use both bins. "Fact or myth?" is the classic.
- `scramble` is one word of 3–14 plain letters (A–Z, no spaces or accents) that the clue makes solvable: a key term from the post, not a random word. `detail` can give its origin.
- `odd` lists 3–4 things of which one doesn't belong as a matter of fact, and the explanation says what the others share.
- Two interactive slides per post is plenty, three at most and only when one of them is a visual puzzle standing in for a chart, pictogram or spectrum; a visual slide beside them gives readers something to look at between plays.

A slide is phone-sized, so `list` and `timeline` slides must stay short: about 12 lines in total, where a timeline date counts as a line and a line holds roughly 34 characters (30 in a list). `npm run content` checks this and tells you by how much to cut.

### Comics

A post can tell its story as a comic: a run of `comic` slides, one panel each, that the reader swipes through. The title slide shows a "Comic · 8 panels" chip and every panel but the last has a "Read on →" tab. The app letters the words on top of the art, so they stay sharp, searchable, translatable and readable by screen readers.

- **Art.** One picture per panel, 4:5 (1080 × 1350), JPEG or PNG under 1.5 MB, with no words in it: no captions, balloons, labels or legible signs. Leave room for the lettering: the caption box takes up to the top (or bottom) fifth of the panel, and the slide counter covers the top right corner. Keep the cast looking the same from panel to panel, frame faces large enough to read on a phone, and give the post a `cover` as well.
- **Caption.** The narrator's box: where and when, and the facts. Dates, numbers and claims belong here, sourced like every other sentence in the post. Keep it under about 120 characters so it takes three lines or fewer.
- **Bubbles.** Up to three per panel, listed in reading order (left to right, top to bottom). `x` and `y` place the bubble's centre in percent of the panel's width and height; `width` is in percent of the width (default 46). `tail` points at the speaker's mouth: put the point just in front of the mouth, not on the face. For a voice from off the panel, point the tail at the panel's edge. `"kind": "thought"` draws a cloud with a trail of puffs, `"shout"` a jagged burst. Name the speaker in `speaker`; screen readers read it out.
- **Check it.** `npm run content` estimates where the lettering lands. It reports a bubble that overlaps another bubble, covers the caption, runs off the panel, holds more than six lines, or sits under the counter or the "Read on" tab. It can't see the art, so open the post in the app (`npm run dev`, then `#/p/<id>`) and check that no bubble hides a face and every tail reaches its speaker.
- **Who says what.** Rule 9 below doesn't apply to comics: you may draw real people and write dialogue for them that the record doesn't contain. The facts must still be right. Dates, numbers and events go in the caption and come from the source, and a bubble must never state anything false about what happened or claim something the person is known to have rejected.
- Eight panels and a quiz fill a post's nine slides. Write each panel's `alt` as you would for an image: what the picture shows, not the words on it. `credit` names the artist and licence when the art isn't the post author's own.

## Images

- Commit images to `content/media/<id>/`. Allowed types: PNG, JPEG, WebP, GIF, AVIF and SVG. File names are lowercase (`a-z`, `0-9`, `-`, `_`).
- Size limits: 1.5 MB for photos (1080 px wide is plenty) and 300 KB for SVG.
- You may link Wikimedia images (`https://upload.wikimedia.org/…` or `https://thumb.wikimedia.org/…`) directly instead of committing them. Other hosts aren't allowed, because hotlinks break and can track readers.
- Only use images you have the right to use: your own diagrams, public domain or openly licensed work. Put the author and licence in `credit`, e.g. `"NASA · Public domain"` or `"Jane Doe · CC BY-SA 4.0"`.
- Every image needs an `alt` text describing what it shows.

## Video clips

A `video` slide plays a short clip, muted and looping while the slide is on screen, with a sound button when it has music. An animated explainer (`"animation": true`) is a lesson with a beginning, so it waits for the reader to tap "Watch" (which can start its music too), stops at the end, and offers to resume or start over when the reader comes back to it. Use one when motion shows something a photo can't: a launch, a collapse, a fluid, an animal's movement, a time-lapse.

**The clip**
- An MP4 file in `content/media/<id>/` with H.264 video, 2–90 seconds long (8–20 s is ideal for footage; animated explainers may run up to 90 s), at most 1080 px wide (480–720 px is plenty) and at most 3 MB (a clip longer than 50 s may use 60 kB a second: 5.4 MB at 90 s), with its index at the start ("fast start"). `npm run content` checks all of this by reading the file.
- A still from the clip as `poster`: a JPEG shown before it plays. It also makes a good `cover` for the post.
- `"fit": "contain"` (the default) shows the whole frame on the field colours with the text below it; `"cover"` fills the slide, for portrait or square footage.

**Making it: `npm run clip`** (needs ffmpeg)

```
npm run clip -- source.mp4 --post <post-id> --name <name> --start 33 --end 44.5 \
  --music track.mp3 --music-start auto
```

It cuts the source between `--start` and `--end`, re-encodes it for phones (with a keyframe every 2 s, so the picture keeps up with the seek bar), drops the original sound and lays in a music excerpt (normalised to a quiet background level, faded in and out), makes `<name>.jpg` from the first second (`--still <s>` picks another moment), checks both files and prints the slide JSON. `--music-start auto` skips silent or quiet passages; give seconds to choose the passage yourself. Leave out `--music` for a silent clip. `--crop 4:5` or `--crop 1:1` crops landscape footage to fill the slide.

**Animated explainers: `npm run explainer`.** Instead of footage, a slide can show an animation drawn by code that walks through the post's idea, with captions and music. Each one is a scene file in `explainers/`; see `explainers/README.md`. Mark the slide `"animation": true`, so Explore lists the post under "Animation" rather than "Video", and credit it `"Reckon · original animation"`.

**Steps.** A clip that explains in stages can list them as `"steps": [{ "start": 0.6, "end": 4.5 }, …]`, in seconds, in order (2 to 24 of them). The seek bar then shows a mark at each step, the reader gets previous and next step buttons, and can choose "Pause after each step" to read at their own pace. `npm run explainer` writes an explainer's steps from its captions, so you rarely type them; for footage, add them only when the clip has distinct stages. Readers can tap the left or right edge of the clip to go back or forward a step. While the clip plays, a jump goes to the step's start and plays on; while it's paused, it stays paused and shows the step finished, 0.3 s before its end (a step's caption only appears as it plays). So that jumping and dragging show the picture straight away, a clip with steps needs a keyframe 0.3 s before each step ends, one within 1 s before each step starts, and keyframes at most 4 s apart; `npm run explainer` encodes it that way, and `npm run content` checks it.

**Rating a short.** Every `video` slide carries `"ratings": { "complexity": 5, "shock": 7 }`, two whole numbers from 1 to 10 that the app shows with the short. Score the post as a whole, as a viewer meets it, and use the scales below, so that the same post would get the same scores from anyone.

| Score | Complexity: how much the viewer must know and keep in mind | Shock factor: how far the result is from what most people expect |
| --- | --- | --- |
| 1–2 | Nothing to follow: you watch it happen (a rover driving on the Moon) | What anyone would expect; good to watch, not surprising |
| 3–4 | One everyday idea with a simple cause, or one term or number to keep in mind (sound travels about 343 m a second) | A neat fact or an unexpected detail that is easy to accept (a geyser named every geyser) |
| 5–6 | A few linked steps or a mechanism with parts, arithmetic at most (how locks lift ships; Moon phases) | Changes how you see something familiar, the kind of fact people repeat (a fridge pumps heat out rather than making cold) |
| 7–8 | School maths or physics needed: probability, waves, energy levels, a formula to follow (the birthday problem; eddy currents) | Contradicts a common belief or a strong intuition (a magnet falling slowly through a non-magnetic tube) |
| 9–10 | Advanced: abstract reasoning beyond school (the Mandelbrot set's complex numbers) | Seems impossible at first, and 10 still feels wrong after the explanation (Monty Hall; single particles building wave stripes) |

Rate the idea, not the production: a beautiful clip of something expected is still a low shock factor. Most posts are chosen for surprise, so shock scores of 1–2 are rare; save 9 and 10 for the few results most people would bet against.

Contributors without ffmpeg can upload a finished MP4 through the MCP server's `media` list like an image (`base64`); the same checks apply.

**Finding the moment.** Pick the seconds where the thing happens, and keep a little before and after. Extract a frame every second (or every quarter-second around the action) with timestamps, look at them, and check the finished clip the same way before you use it.

**Sources and licences.** Use footage you may reuse and credit it like an image, saying it is an excerpt: `"NASA/JPL-Caltech · Public domain · excerpt"`.
- NASA (images.nasa.gov, svs.gsfc.nasa.gov): generally not copyrighted; credit NASA and the centre. Skip items NASA marks as third-party, and title cards or logos.
- ESO, ESA/Hubble and ESA/Webb: CC BY 4.0 for images and videos, but not their music.
- Wikimedia Commons: public domain, CC0, CC BY or CC BY-SA files; read the file page's licence.
- US federal agencies such as USGS and NOAA: generally public domain.
- Old films in the public domain (Library of Congress, Internet Archive), checked item by item.
- No footage that features identifiable private people, nothing graphic, and no YouTube or other streams you can't download under a licence.
- `href` links the page the footage came from.

**Music instead of the original sound.** Original soundtracks often carry narration in another language, crowd noise or music that is not licensed for reuse, so clips use a music bed instead, or no sound.
- Choose a track whose mood fits the clip: calm and spacious for orbits and nebulae, tense for storms and collapses, playful for animals, period music for old film.
- Use music you may reuse: Kevin MacLeod's catalogue at incompetech.com (CC BY 4.0) has mood tags and tempos; public-domain recordings work too.
- Credit it in `music`, e.g. `"“Mesmerizing Galaxy” Kevin MacLeod (incompetech.com) · CC BY 4.0"`. The validator requires a `music` credit whenever the clip has a sound track, and rejects one when it hasn't.

## Explore labs

An `explore` slide puts a small working experiment in the post: the reader drags, taps and types, and finds the answer out for themselves. Every animated explainer has one, right after its video slide, so the reader can watch the idea and then try it. The experiments are built into the app; `lab` picks one by name, and `shared/labs.ts` lists them all with what each lets the reader do.

```json
{
  "type": "explore",
  "lab": "birthday-problem",
  "prompt": "Drag the number of people and find the smallest room where a shared birthday is more likely than not.",
  "takeaway": "23 people: 50.7%. The match comes from the 253 pairs among everyone, not from your own birthday."
}
```

- **`prompt`** sets a goal the reader can reach in the lab: something to find, beat or try, in one or two short sentences. Each lab knows when its goal is reached (found 23, put the ball in orbit, caught a drop).
- **`takeaway`** replaces the prompt once the goal is reached: what the reader has just discovered and why it works. Like every slide, it must be accurate; don't claim more than the lab shows.
- **`heading`** is optional; it defaults to "Try it yourself".

**Adding a lab** takes code: a component in `src/labs/<field>/<lab>.tsx` (built from `src/labs/kit.tsx`: a canvas `Stage`, `Range` sliders, `Choice` buttons, `Readouts`, `useGoal`, and `useAudio` and `pluck` for sound), a line in `shared/labs.ts` and in `src/labs/index.ts`, German for its texts in `src/i18n/de.ts`, and a test of its maths in `test/labs.test.ts`. Keep the model honest and say on screen when it is simplified. Each lab belongs to one post, and a test checks that every animation post has one. A lab fits on a phone-sized 4:5 slide under its prompt and takes about a minute to explore.

### Drawing SVG diagrams (great for LLMs)

SVG is the best way for a language model to make a visual: a labelled diagram, a simple chart, a process. Rules:

- Use a `viewBox`. For a slide-filling diagram use `viewBox="0 0 1080 1350"` (4:5). For something that sits inside the card, use `0 0 1080 1080` or similar and `"fit": "contain"`.
- The background shows the post's dark gradient, so draw in white or light colours with thick strokes (6–12 px at that scale). Use a transparent background, or a rounded card of your own.
- Text needs `font-family="system-ui, sans-serif"` and should be large: 48–72 px at that scale, with a few words per label.
- No scripts, event handlers (`onload=`…), `<foreignObject>`, `<use>`, external links, `url(...)` references other than `#fragment`, or DOCTYPE/ENTITY declarations. The validator rejects them because SVGs are served from the app's own origin.
- Keep it simple. Under 40 shapes reads better on a phone than a dense chart.

## Style and accuracy rules

This is a learning app. A wrong fact is worse than no post.

1. **Only well-established facts.** Hedge numbers correctly ("about", "roughly", "estimates range from…"). If experts disagree, say so.
2. **No myths stated as facts**: "we use 10% of our brains", "the Great Wall is visible from space", "Vikings wore horned helmets", misattributed quotes, and so on. Myth-busting posts (a `compare` slide works well) are welcome.
3. **Cite a real, specific source** where the claim can be checked: Wikipedia, a journal, NASA/NOAA/NIH, a museum or a university. Make sure the URL exists.
4. **Explain, don't just state.** The body should answer *why* or *how*.
5. **The title is the hook**: a complete sentence that makes someone stop scrolling. It must be true without needing the caption.
6. **One topic per post.** Check existing ids (`list_posts`, or `content/posts/<field>/`) and don't duplicate a topic.
7. **No medical, legal or financial advice**, nothing hateful, and no gratuitous violence.
8. **Write for a curious 16-year-old**: short sentences, concrete examples, no jargon without a quick explanation.
9. **Never invent quotes, studies, statistics or images of real people.** Comics are the exception for quotes and images: see "Who says what" under "Comics".
10. Plain text in the right fields: no markdown headings, no emoji inside the text, no hashtags in the body.
