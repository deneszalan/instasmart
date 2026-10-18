# InstaSmart content guide

InstaSmart is an Instagram-style feed where every post teaches one surprising, true thing. This folder is the app's whole library: one JSON file per post, plus the images the posts use. Anything merged here ships with the next deploy.

This guide is written for people **and LLMs** contributing posts.

## Where files go

```
content/
  posts/<field>/<id>.json      one post per file
  media/<id>/<file>            images used by that post (optional)
  schema/post.schema.json      JSON Schema (generated — don't edit)
```

- `id` is `<field>-<slug>` in lowercase kebab-case, e.g. `physics-mpemba-effect`. The file name is the id.
- Images are referenced by file name only (`"src": "orbit.svg"`) and live in `content/media/<id>/orbit.svg`.
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
| `author` | no | `{ "name", "kind": "ai" \| "human", "model"? }`. LLMs use `"kind": "ai"`; the app shows an AI badge. |
| `createdAt` | no | `YYYY-MM-DD` |

Text in `body` and most slide fields supports `**bold**`, `*italic*`, `` `code` `` and `[links](https://…)`. Nothing else: no headings, no HTML, no emoji inside the text.

## Slide types

Each slide is a 4:5 card on the post's gradient. Pick the type that fits the idea, and keep one idea per slide.

| Type | Use it for | Shape |
| --- | --- | --- |
| `text` | An explanation, a twist, "why it matters" | `{ "type": "text", "heading"?: "≤40", "text": "≤320" }` |
| `stat` | One striking number | `{ "type": "stat", "value": "86 billion", "label": "neurons in a human brain", "text"?: "≤220" }` |
| `list` | 2–6 short items: examples, steps, parts | `{ "type": "list", "heading"?, "style"?: "bullets" \| "numbers" \| "steps", "items": ["≤110", …] }` |
| `quote` | A real, verifiable quotation | `{ "type": "quote", "text": "≤240", "attribution"?: "≤80" }` |
| `compare` | Myth vs fact, before vs after, A vs B | `{ "type": "compare", "heading"?, "left": { "label": "Myth", "text": "≤160" }, "right": { "label": "Fact", "text": "≤160" } }` |
| `timeline` | 2–5 dated events | `{ "type": "timeline", "heading"?, "events": [{ "when": "1687", "text": "≤110" }, …] }` |
| `image` | A photo or a diagram | `{ "type": "image", "src": "orbit.svg", "alt": "…", "caption"?: "≤200", "fit"?: "cover" \| "contain", "credit"?: "≤120" }` |

Use `"fit": "cover"` for photos (they fill the card) and `"fit": "contain"` for diagrams (the whole image shows on the gradient).

## Images

- Commit images to `content/media/<id>/`. Allowed types: PNG, JPEG, WebP, GIF, AVIF and SVG. File names are lowercase (`a-z`, `0-9`, `-`, `_`).
- Size limits: 1.5 MB for photos (1080 px wide is plenty) and 300 KB for SVG.
- You may link Wikimedia images (`https://upload.wikimedia.org/…` or `https://thumb.wikimedia.org/…`) directly instead of committing them. Other hosts aren't allowed, because hotlinks break and can track readers.
- Only use images you have the right to use: your own diagrams, public domain or openly licensed work. Put the author and licence in `credit`, e.g. `"NASA · Public domain"` or `"Jane Doe · CC BY-SA 4.0"`.
- Every image needs an `alt` text describing what it shows.

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
9. **Never invent quotes, studies, statistics or images of real people.**
10. Plain text in the right fields: no markdown headings, no emoji inside the text, no hashtags in the body.
