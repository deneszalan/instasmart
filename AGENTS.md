# Working on Reckon

Reckon is an Instagram-style feed of knowledge posts. React + TypeScript + Vite; Node 22.18+ runs the TypeScript scripts directly.

## Adding or editing posts

All content lives in `content/` as one JSON file per post. Read `content/README.md` before writing posts. It covers the format, the slide types, image rules and the accuracy rules.

1. Pick a field and check `content/posts/<field>/` so you don't duplicate a topic.
2. Create `content/posts/<field>/<field>-<slug>.json` (`npm run content -- new <field> <slug>` makes a starter). Put images in `content/media/<id>/`.
3. Sign the post: `"author": { "name": "Claude", "kind": "ai" }`, or `"ChatGPT"`, `"Fable"`, or your own name. See "Signing posts" in `content/README.md`.
4. Run `npm run content` and fix every problem it reports.
5. Commit only the content files, one topic per post, and open a pull request.

Facts must be correct and sourced. If you aren't sure about something, leave it out.

## Code

- `npm run dev`: the app. `npm test`: unit tests. `npm run typecheck` and `npm run build` should both pass before you push.
- `shared/` holds the content schema and validator, used by the app, `scripts/content.ts` and the MCP server in `mcp/`. Imports in `shared/`, `scripts/` and `mcp/` use explicit `.ts` extensions, because Node runs them without a build step.
- After changing `shared/schema.ts`, run `npm run content -- schema` to regenerate `content/schema/post.schema.json`. A test fails if it's stale.
