import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { FIELD_IDS, FIELDS } from '../shared/fields.ts';
import { formatIssues, localMedia, Post, postJsonSchema } from '../shared/schema.ts';
import {
  type ContentFile,
  MEDIA_DIR,
  mediaPath,
  mediaProblems,
  postPath,
  serializePost,
  validateContent,
} from '../shared/validate.ts';
import type { ContentStore } from './stores.ts';

const MediaInput = z
  .object({
    name: z.string().describe('File name the post refers to, e.g. "orbit-diagram.svg" (lowercase, a-z 0-9 - _).'),
    svg: z.string().optional().describe('SVG markup, for diagrams and illustrations you draw yourself.'),
    base64: z.string().optional().describe('Base64-encoded PNG, JPEG, WebP, GIF or AVIF bytes.'),
  })
  .describe('An image for the post. Give exactly one of `svg` or `base64`.');

type MediaInput = z.infer<typeof MediaInput>;

// Kept loose so validate_post can explain every problem itself; the full schema is in get_content_guide.
const PostInput = z
  .record(z.string(), z.unknown())
  .describe(
    'The post as JSON: { id: "<field>-<slug>", field, title (≤90 chars, the hook), emoji, body (2–5 sentences), ' +
      'slides?: [{ type: "text" | "stat" | "list" | "quote" | "compare" | "timeline" | "image" | "quiz" | "reveal" | "estimate" | "order", … }], tags: ["lowercase"], ' +
      'source: { label, url }, author: { name: "Claude" | "ChatGPT" | "Fable" | <your name>, kind: "ai" } }. ' +
      'Call get_content_guide for every option; validate_post explains any problem.',
  );

export interface PreparedPost {
  post?: Post;
  files: ContentFile[];
  problems: string[];
}

const text = (s: string): CallToolResult => ({ content: [{ type: 'text', text: s }] });
const fail = (s: string): CallToolResult => ({ content: [{ type: 'text', text: s }], isError: true });

/** Turn tool input into repository files, collecting every problem an LLM needs to fix. */
export function preparePost(input: unknown, media: MediaInput[] = [], author?: string): PreparedPost {
  const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  const withDefaults = isObject(input)
    ? {
        createdAt: new Date().toISOString().slice(0, 10),
        ...input,
        // Uploads through this server are always labelled as AI-written.
        author: { name: author ?? 'AI contributor', ...(isObject(input.author) ? input.author : {}), kind: 'ai' },
      }
    : input;

  const parsed = Post.safeParse(withDefaults);
  if (!parsed.success) return { files: [], problems: formatIssues(parsed.error).map((p) => `post.${p}`) };
  const post = parsed.data;

  const problems: string[] = [];
  const files: ContentFile[] = [{ path: postPath(post), bytes: new TextEncoder().encode(serializePost(post)) }];
  for (const [i, m] of media.entries()) {
    if ((m.svg === undefined) === (m.base64 === undefined)) {
      problems.push(`media[${i}] (${m.name}): give exactly one of "svg" or "base64"`);
      continue;
    }
    const bytes = m.svg !== undefined ? new TextEncoder().encode(m.svg) : Buffer.from(m.base64!, 'base64');
    const own = mediaProblems(m.name, bytes);
    if (own.length) problems.push(...own.map((p) => `media[${i}] (${m.name}): ${p}`));
    else files.push({ path: mediaPath(post.id, m.name), bytes });
  }
  if (problems.length) return { post, files, problems };

  for (const p of validateContent(files).problems) problems.push(`${p.file}: ${p.message}`);
  return { post, files, problems };
}

function guide(root: string): string {
  const doc = readFileSync(join(root, 'content', 'README.md'), 'utf8');
  const fields = FIELDS.map((f) => `- \`${f.id}\` — ${f.name}: ${f.scope}`).join('\n');
  return `${doc}\n\n## Fields\n\n${fields}\n\n## JSON Schema\n\n\`\`\`json\n${JSON.stringify(postJsonSchema())}\n\`\`\`\n`;
}

export function createServer(store: ContentStore, root: string): McpServer {
  const server = new McpServer(
    { name: 'reckon', version: '1.0.0' },
    {
      instructions:
        'Publish bite-sized, accurate knowledge posts to the Reckon feed. Read get_content_guide once, check list_posts to avoid duplicates, ' +
        'run validate_post until it passes, then submit_post. Every claim must be correct and sourced.',
    },
  );
  const clientName = () => server.server.getClientVersion()?.name;

  server.registerTool(
    'get_content_guide',
    {
      title: 'Content guide',
      description: 'The post format, every slide type, style and accuracy rules, image rules, the field list and the JSON Schema. Read this before writing posts.',
      annotations: { readOnlyHint: true },
    },
    async () => text(guide(root)),
  );

  server.registerTool(
    'list_posts',
    {
      title: 'List posts',
      description: 'Ids of the posts already in the app (ids describe the topic). Check this to avoid duplicates.',
      inputSchema: { field: z.enum(FIELD_IDS).optional().describe('Only this field.') },
      annotations: { readOnlyHint: true },
    },
    async ({ field }) => {
      const paths = await store.listPaths();
      const ids = paths
        .filter((p) => p.startsWith('content/posts/') && p.endsWith('.json'))
        .map((p) => p.split('/').slice(2))
        .filter(([f]) => !field || f === field)
        .map(([f, file]) => `${f}: ${file.replace(/\.json$/, '')}`);
      return text(ids.length ? ids.join('\n') : 'No posts yet.');
    },
  );

  server.registerTool(
    'get_post',
    {
      title: 'Get post',
      description: 'The JSON of an existing post, e.g. to improve it and resubmit with replace: true.',
      inputSchema: { id: z.string().describe('Post id, e.g. "physics-mpemba-effect".') },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      const field = FIELD_IDS.find((f) => id.startsWith(`${f}-`));
      const json = field ? await store.readText(`content/posts/${field}/${id}.json`) : null;
      return json ? text(json) : fail(`No post with id "${id}".`);
    },
  );

  server.registerTool(
    'validate_post',
    {
      title: 'Validate post',
      description: 'Check a post and its images without saving anything. Returns every problem to fix, or confirms it is ready.',
      inputSchema: { post: PostInput, media: z.array(MediaInput).optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ post, media }) => {
      const prepared = preparePost(post, media, clientName());
      if (prepared.problems.length) return fail(`Not valid yet:\n- ${prepared.problems.join('\n- ')}`);
      const taken = (await store.listPaths()).includes(postPath(prepared.post!));
      return text(
        `Valid. It will be saved as ${prepared.files.map((f) => f.path).join(', ')}.` +
          (taken ? `\nNote: a post with id "${prepared.post!.id}" already exists; submit with replace: true to update it, or pick a new id.` : ''),
      );
    },
  );

  server.registerTool(
    'submit_post',
    {
      title: 'Submit post',
      description:
        'Save a post (and its images) to the Reckon repository. Depending on configuration this opens a pull request for review, ' +
        'commits directly, or writes to a local checkout. Validate first.',
      inputSchema: {
        post: PostInput,
        media: z.array(MediaInput).optional(),
        replace: z.boolean().optional().describe('Overwrite an existing post with the same id.'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ post: input, media, replace }) => {
      const prepared = preparePost(input, media, clientName());
      if (prepared.problems.length) return fail(`Not submitted. Fix these first:\n- ${prepared.problems.join('\n- ')}`);
      const post = prepared.post!;

      const existing = await store.listPaths();
      const exists = existing.includes(postPath(post));
      if (exists && !replace) {
        return fail(`A post with id "${post.id}" already exists. Pick a new id, or pass replace: true to update it.`);
      }
      const keep = new Set(localMedia(post).map((name) => mediaPath(post.id, name)));
      const remove = existing.filter((p) => p.startsWith(`${MEDIA_DIR}/${post.id}/`) && !keep.has(p));

      const verb = exists ? 'Update' : 'Add';
      try {
        const result = await store.submit({
          files: prepared.files,
          remove,
          message: `${verb} ${post.field} post: ${post.title}\n\nSubmitted by ${post.author?.name} via the Reckon MCP server.`,
          title: `${verb} ${post.field} post: ${post.title}`,
          description: [
            `**${post.title}**`,
            '',
            post.body,
            '',
            `- Field: ${post.field}`,
            `- Slides: ${1 + (post.slides?.length ?? 0)}`,
            `- Source: [${post.source.label}](${post.source.url})`,
            `- Author: ${post.author?.name}${post.author?.model ? ` (${post.author.model})` : ''}`,
            '',
            'Submitted via the Reckon MCP server. Please check the facts against the source before merging.',
          ].join('\n'),
          branchHint: post.id,
        });
        const where =
          result.kind === 'pull-request'
            ? `Opened a pull request for review: ${result.url}`
            : result.kind === 'commit'
              ? `Committed: ${result.url}`
              : `Saved to the local checkout: ${result.paths.join(', ')}`;
        return text(`${where}\nPost id: ${post.id}`);
      } catch (err) {
        return fail(`Saving failed: ${(err as Error).message}`);
      }
    },
  );

  return server;
}
