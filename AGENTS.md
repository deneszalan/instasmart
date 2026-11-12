# Working on Reckon

Reckon is an Instagram-style feed of animated knowledge posts, with a News tab for posts hooked to the news. React + TypeScript + Vite; Node 22.18+ runs the TypeScript scripts directly.

## Adding or editing posts

All content lives in `content/` as one JSON file per post. Read `content/README.md` before writing posts. It covers the format, the slide types, image rules and the accuracy rules.

1. Pick a field and check `content/posts/<field>/` so you don't duplicate a topic.
2. Create `content/posts/<field>/<field>-<slug>.json` (`npm run content -- new <field> <slug>` makes a starter). Put images and video clips in `content/media/<id>/`; `npm run clip` cuts a clip and sets it to music, and `npm run explainer` renders an animated explainer from `explainers/` (see "Video clips" in `content/README.md`).
3. Sign the post: `"author": { "name": "Claude", "kind": "ai" }`, or `"ChatGPT"`, `"Fable"`, or your own name. See "Signing posts" in `content/README.md`.
4. Run `npm run content` and fix every problem it reports.
5. Commit only the content files, one topic per post, and open a pull request.

Facts must be correct and sourced. If you aren't sure about something, leave it out.

## Editions

The code builds five separate apps that don't link to each other. **Reckon** (English) has its posts in `content/`. **Lesefutter** (German, for learners of German) has its posts in `editions/lesefutter/content/`; read `editions/lesefutter/README.md` before writing for it. **Roma** (English, about Rome, from the ancient city to its churches and art) has its posts in `editions/roma/content/`; read `editions/roma/README.md` before writing for it. **Tunisia 1943** (English with French, about the Second World War in Tunisia: the campaign, the occupation, its literature, films and remembrance) has its posts in `editions/tunisia/content/`; read `editions/tunisia/README.md` before writing for it. **Hungary 1956** (*Ötvenhat*: the Hungarian revolution and freedom fight of 1956, from its background to its consequences; it opens in Hungarian and switches to English) has its posts in `editions/hungary/content/`, written in English and translated into Hungarian; read `editions/hungary/README.md` before writing for it. `shared/editions.ts` sets each app's name, language, fields and storage, and the other languages a reader can switch to (Roma offers German, Tunisia 1943 French, Hungary 1956 Hungarian, which is also the language it opens in; posts get translations in `content/i18n/<lang>/`, see "Translations" in `content/README.md`). `npm run content` checks every app. Every app works offline (`offline` in `shared/editions.ts`): an offline worker (`src/offline-worker.js`, built as `sw.js`) keeps the app itself, and Profile's "Use without internet" lets the reader save the newest posts (as many as they choose, with the estimated size) and switch to offline mode, where only those show. `npm run dev -- --mode lesefutter`, `--mode roma`, `--mode tunisia` or `--mode hungary` runs one of the other apps, and `npm run build` builds all five (they go to `dist/lesefutter/`, `dist/roma/`, `dist/tunisia/` and `dist/hungary/`).

## Code

- `npm run dev`: the app. `npm test`: unit tests. `npm run typecheck` and `npm run build` should both pass before you push.
- `shared/` holds the content schema and validator, used by the app, `scripts/content.ts` and the MCP server in `mcp/`. Imports in `shared/`, `scripts/` and `mcp/` use explicit `.ts` extensions, because Node runs them without a build step.
- After changing `shared/schema.ts`, run `npm run content -- schema` to regenerate `content/schema/post.schema.json`. A test fails if it's stale.
- After adding or changing a font in `explainers/fonts/`, run `npm run fonts` to regenerate its catalogue and list. A test fails if they're stale.
- App text goes through `t('English text')` (`src/i18n/`). Add the German for every new string to `src/i18n/de.ts`, the French to `src/i18n/fr.ts` for the app's own text and the labs of Tunisia 1943, and the Hungarian to `src/i18n/hu.ts` for the app's own text and the labs of Hungary 1956; tests check that none is missing.
