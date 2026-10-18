# InstaSmart

An Instagram-style app where the endless feed is made of bite-sized knowledge, not user posts. Scroll, double-tap what you like, save what you want to remember, and watch your "learned" count grow.

## Features

- **Endless feed.** A hand-written library of knowledge pieces across 16 fields: physics, space, biology, chemistry, mathematics, history, psychology, economics, computer science, language, philosophy, art & design, music, Earth science, the human body and engineering.
  - Pieces you haven't read come first. Two posts in a row never come from the same field when it can be avoided.
  - When you've seen the whole library you get a "you've explored everything" marker, and the feed carries on with a fresh shuffle.
- **Live posts from Wikipedia.** Wikipedia's featured article and picture of the day are mixed in, walking back one day at a time, so the feed never runs dry. You can turn this off in Profile.
- **Carousel posts.** Some pieces have extra slides that go deeper. Swipe, or use the arrows on desktop.
- **Stories.** A "Daily 5" mix plus one story per field. Tap to move forward or back, hold to pause, and use the arrow keys or Space on desktop.
- **Instagram interactions.** Double-tap to like, save with the bookmark, share (native share sheet, or the link is copied). The comment button opens a **Go deeper** sheet with the full explanation, the source and related pieces.
- **Explore.** A search across every piece (`#tag` matches tags exactly), with field filters and a mosaic grid.
- **Saved and Profile.** Your saved pieces, a learning streak, progress per field, a light/dark/auto theme, and a reset button.
- **Local only.** Everything is stored in your browser's `localStorage`. There's no account and no backend.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the dev server                              |
| `npm run build`     | Type-check and build a static site into `dist/`   |
| `npm run preview`   | Serve the production build                        |
| `npm test`          | Run the unit tests (feed logic, data checks, state) |
| `npm run typecheck` | Type-check only                                   |

The build uses relative paths, so you can host `dist/` from any static host or sub-path, GitHub Pages included.

## Project layout

```
src/
  data/
    fields.ts          the 16 fields: names, handles, emoji, colours
    cards/*.ts         the knowledge library, one file per field
    library.ts         combines every card file
  lib/
    feed.ts            endless feed: shuffling, field spreading, search
    wiki.ts            Wikipedia featured-content client
    stories.ts         builds the daily stories
    route.ts           hash routing (#/explore, #/p/<id>, …)
  state/store.tsx      likes, saves, reading history, streak and settings
  components/          post, carousel, stories, sheets, tiles
  views/               Feed, Explore, Saved, Profile
  test/                Vitest unit tests
```

## Adding knowledge

Add an entry to the right file in `src/data/cards/`:

```ts
{
  id: 'physics-mpemba-effect',          // `${field}-${slug}`, unique
  field: 'physics',
  title: 'Hot water can sometimes freeze faster than cold',  // the hook shown on the image
  emoji: '🧊',
  body: 'Two to four sentences explaining why…',             // the caption
  slides: [{ heading: 'Why it’s debated', text: '…' }],      // optional: makes a carousel
  tags: ['thermodynamics', 'water'],
  source: { label: 'Wikipedia: Mpemba effect', url: 'https://en.wikipedia.org/wiki/Mpemba_effect' },
}
```

`npm test` checks every card: unique ids, sensible lengths, lowercase tags and an https source.
