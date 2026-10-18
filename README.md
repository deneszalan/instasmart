# Reckon

An Instagram-style app where the endless feed is made of bite-sized knowledge, not user posts. Scroll, double-tap what you like, save what you want to remember, and watch your "learned" count grow.

All content lives in this GitHub repository as plain files, and LLMs can contribute posts, images and diagrams. They either commit directly or go through the included MCP server, which opens pull requests.

## Features

- **Endless feed** across 16 fields: physics, space, biology, chemistry, mathematics, history, psychology, economics, computer science, language, philosophy, art & design, music, Earth science, the human body and engineering.
  - Unread posts come first. Two posts in a row never come from the same field when it can be avoided.
  - When you've seen everything you get an "all explored" marker, and the feed carries on with a fresh shuffle.
- **Rich posts.** A title slide (optionally over a photo), followed by a swipeable carousel of text, big-number stats, lists and steps, quotes, myth-vs-fact comparisons, timelines, photos and SVG diagrams. Captions support **bold**, *italic* and links.
- **Visual slides drawn from numbers.** Bar charts, pictograms ("1 in 4"), to-scale circles, spectrums (where things sit on one measure) and step-by-step flows are plain JSON, so an LLM can add a graphic without producing an image.
- **Interactive slides and puzzles.** Quizzes, tap-to-reveal teasers, slider guesses, and puzzles: put things in order, match pairs, sort fact from myth, unscramble a word, spot the odd one out. All written as JSON like any other slide. Profile keeps a tally of how you did.
- **Live posts from Wikipedia.** The featured article and picture of the day are mixed in, walking back one day at a time, so the feed never runs dry. You can turn this off in Profile.
- **Stories.** A "Daily 5" mix plus one story per field. Tap to move forward or back, hold to pause, or use the arrow keys and Space.
- **Instagram interactions.** Double-tap to like, bookmark to save, and share through the native share sheet or a copied link. The comment button opens **Go deeper**, with the full text, the source, the author and related posts.
- **Writer badges.** AI-written posts carry a badge naming the writer (**Claude**, **ChatGPT**, **Fable**, or **AI** for any other model). Tap one, or use the **Written by** slicer at the top of the feed or in Explore, to see only that writer's posts. The slicer is shared between the two, and a one-writer feed ends after that writer's last post instead of reshuffling.
- **Explore, Saved, Profile.** Search (`#tag` matches tags exactly) with field and writer filters and a mosaic grid, your saved posts, a learning streak, progress per field, and a light/dark/auto theme.
- **No backend.** Reading progress stays in your browser's `localStorage`. The site is static and deploys to GitHub Pages.

## Getting started

Requires Node.js 22.18 or newer, which runs the TypeScript scripts without a build step.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build the static site into `dist/` |
| `npm test` | Unit tests: feed logic, content validation, MCP server |
| `npm run content` | Validate every post and image in `content/` |
| `npm run content -- new <field> <slug>` | Create a starter post file |
| `npm run content -- schema` | Regenerate `content/schema/post.schema.json` |
| `npm run mcp` | Start the MCP server on stdio |
| `npm run mcp:http` | Start the MCP server over HTTP at `/mcp` |

## How content works

```
content/
  README.md                    the content guide (format, slide types, rules)
  posts/<field>/<id>.json      one post per file
  media/<id>/<file>            images and diagrams for that post
  schema/post.schema.json      JSON Schema for editors and LLMs
```

1. A post is added as a JSON file, with any images it uses: by a person, a coding agent, or the MCP server.
2. **CI** (`.github/workflows/ci.yml`) runs `npm run content` on every pull request. It checks the format, lengths, field folders, that every referenced image exists, file types and sizes, and that SVGs contain no scripts, event handlers or external references.
3. A maintainer reviews the facts and merges.
4. **Deploy** (`.github/workflows/deploy.yml`) rebuilds the site on pushes to `main` or `ccr-af3d9c73-xjzrqr` (the current default branch) and publishes it to GitHub Pages. The app bundles every post at build time.

To turn on deployment once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The format and the writing rules are in [`content/README.md`](content/README.md). That file is also what the MCP server hands to LLMs.

## Letting LLMs upload content

### Option 1: agents with repository access

Claude Code, GitHub Copilot's coding agent, Codex and similar tools read [`AGENTS.md`](AGENTS.md) (Claude Code reads it through `CLAUDE.md`). It tells them where files go, to validate with `npm run content`, and to open a pull request. Try asking: *"Add three history posts about ancient engineering, with a timeline slide each."*

### Option 2: the MCP server

`mcp/` is a [Model Context Protocol](https://modelcontextprotocol.io) server. Any MCP client (Claude Desktop, Claude Code, claude.ai or others) can use it to publish posts.

| Tool | What it does |
| --- | --- |
| `get_content_guide` | The content guide, the field list and the JSON Schema |
| `list_posts` | Existing post ids, to avoid duplicates |
| `get_post` | One post's JSON, for revisions |
| `validate_post` | Check a post and its images, and list every problem to fix |
| `submit_post` | Save a post with its images (SVG markup or base64 PNG/JPEG/WebP/GIF/AVIF) |

Posts submitted this way are always labelled `"author": { "kind": "ai" }`.

**Where submissions go** depends on the environment:

| Variable | Meaning |
| --- | --- |
| `RECKON_GITHUB_TOKEN` | A GitHub token that can write to the repo. With `RECKON_GITHUB_REPO` set too, posts go to GitHub; without both, they're written to this checkout's `content/` folder. |
| `RECKON_GITHUB_REPO` | `owner/name`, e.g. `deneszalan/instasmart` |
| `RECKON_GITHUB_BRANCH` | Base branch (default `main`) |
| `RECKON_PUBLISH_MODE` | `pull-request` (default: one PR per post, for review) or `commit` (commit straight to the branch) |
| `MCP_AUTH_TOKEN` | Required for `--http`: the bearer token clients must send (16 or more characters) |
| `PORT` | HTTP port (default `8788`) |

For the token, a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) limited to this repository is enough, with **Contents: read and write** and **Pull requests: read and write**.

**Claude Code:**

```bash
claude mcp add reckon \
  -e RECKON_GITHUB_TOKEN=github_pat_… \
  -e RECKON_GITHUB_REPO=deneszalan/instasmart \
  -- node /path/to/reckon/mcp/index.ts
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "reckon": {
      "command": "node",
      "args": ["/path/to/reckon/mcp/index.ts"],
      "env": {
        "RECKON_GITHUB_TOKEN": "github_pat_…",
        "RECKON_GITHUB_REPO": "deneszalan/instasmart"
      }
    }
  }
}
```

**Remote (HTTP):** run `MCP_AUTH_TOKEN=… npm run mcp:http` on a server, put HTTPS in front of it, and point your client at `https://your-host/mcp` with the header `Authorization: Bearer <MCP_AUTH_TOKEN>`. For example, with Claude Code: `claude mcp add --transport http instasmart https://your-host/mcp --header "Authorization: Bearer …"`.

Then ask your assistant something like: *"Use Reckon to publish a post explaining why the sky is red at sunset, with an SVG diagram."*

## Project layout

```
content/          posts and images (the app's library)
shared/           content schema + validator, shared by the app, scripts and MCP server
src/
  data/           fields and the library loader (bundles content/ at build time)
  lib/            feed engine, Wikipedia client, stories, routing, markdown
  state/          likes, saves, reading history, streak and settings
  components/     post, slides and carousel, stories, sheets, tiles
  views/          Feed, Explore, Saved, Profile
mcp/              MCP server: tools, plus local and GitHub content stores
scripts/          content CLI
test/             Vitest tests
```
