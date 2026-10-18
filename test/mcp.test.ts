import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../mcp/server.ts';
import { GitHubStore, LocalStore, type ContentStore } from '../mcp/stores.ts';

const repoRoot = join(__dirname, '..');
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080"><circle cx="540" cy="540" r="300" fill="none" stroke="#fff" stroke-width="10"/></svg>';

const post = {
  id: 'space-mcp-test-orbit',
  field: 'space',
  title: 'Planets move fastest when they are closest to the Sun',
  emoji: '🪐',
  body: 'Kepler’s second law says a line from the Sun to a planet sweeps out **equal areas in equal times**, so the planet speeds up near the Sun and slows down far away.',
  slides: [
    { type: 'image', src: 'orbit.svg', alt: 'An elliptical orbit around the Sun', fit: 'contain' },
    { type: 'stat', value: '~3 km/s', label: 'difference in Earth’s orbital speed between January and July' },
  ],
  tags: ['kepler', 'orbits'],
  source: { label: 'Wikipedia: Kepler’s laws of planetary motion', url: 'https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion' },
};

async function connect(store: ContentStore) {
  const server = createServer(store, repoRoot);
  const client = new Client({ name: 'test-llm', version: '1.0.0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const result = (await client.callTool({ name, arguments: args })) as { content: { text: string }[]; isError?: boolean };
    return { text: result.content.map((c) => c.text).join('\n'), isError: !!result.isError };
  };
  return { client, call };
}

describe('MCP server with a local checkout', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'reckon-'));
    cpSync(join(repoRoot, 'content', 'README.md'), join(dir, 'content', 'README.md'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('exposes the publishing tools', async () => {
    const { client } = await connect(new LocalStore(dir));
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['get_content_guide', 'get_post', 'list_posts', 'submit_post', 'validate_post']);
  });

  it('serves the guide with fields and schema', async () => {
    const { call } = await connect(new LocalStore(dir));
    const { text } = await call('get_content_guide');
    expect(text).toContain('# Reckon content guide');
    expect(text).toContain('`physics` — Physics');
    expect(text).toContain('"title":"Reckon post"');
  });

  it('explains what to fix', async () => {
    const { call } = await connect(new LocalStore(dir));
    const result = await call('validate_post', { post: { ...post, tags: ['Bad Tag'] }, media: [{ name: 'orbit.svg', svg: '<svg onload="x()"></svg>' }] });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('post.tags[0]');

    const media = await call('validate_post', { post, media: [{ name: 'orbit.svg', svg: '<svg viewBox="0 0 1 1" onload="x()"></svg>' }] });
    expect(media.text).toContain('media[0] (orbit.svg): must not contain event handler');

    const missing = await call('validate_post', { post });
    expect(missing.text).toContain('image "orbit.svg" is missing');
  });

  it('saves a valid post with its image, labelled as AI-written', async () => {
    const { call } = await connect(new LocalStore(dir));
    expect((await call('validate_post', { post, media: [{ name: 'orbit.svg', svg: SVG }] })).text).toContain('Valid.');

    const result = await call('submit_post', { post, media: [{ name: 'orbit.svg', svg: SVG }] });
    expect(result.isError).toBe(false);
    const saved = JSON.parse(readFileSync(join(dir, 'content/posts/space/space-mcp-test-orbit.json'), 'utf8'));
    expect(saved.author).toEqual({ name: 'test-llm', kind: 'ai' });
    expect(saved.$schema).toBe('../../schema/post.schema.json');
    expect(readFileSync(join(dir, 'content/media/space-mcp-test-orbit/orbit.svg'), 'utf8')).toBe(SVG);

    expect((await call('list_posts', { field: 'space' })).text).toBe('space: space-mcp-test-orbit');
    expect(JSON.parse((await call('get_post', { id: post.id })).text).title).toBe(post.title);

    // Same id again needs replace: true, which also drops images the new version no longer uses.
    expect((await call('submit_post', { post, media: [{ name: 'orbit.svg', svg: SVG }] })).text).toContain('already exists');
    const replaced = await call('submit_post', { post: { ...post, slides: [post.slides[1]] }, replace: true });
    expect(replaced.isError).toBe(false);
    expect(existsSync(join(dir, 'content/media/space-mcp-test-orbit/orbit.svg'))).toBe(false);
  });
});

describe('GitHubStore', () => {
  it('commits every file in one commit and opens a pull request', async () => {
    const calls: { method: string; url: string; body?: Record<string, unknown> }[] = [];
    const responses: Record<string, unknown> = {
      'GET /git/trees/main?recursive=1': { tree: [{ path: 'content/posts/space/space-old.json', type: 'blob' }], truncated: false },
      'GET /git/ref/heads/main': { object: { sha: 'base-sha' } },
      'GET /git/commits/base-sha': { tree: { sha: 'base-tree' } },
      'POST /git/blobs': { sha: 'blob-sha' },
      'POST /git/trees': { sha: 'new-tree' },
      'POST /git/commits': { sha: 'new-commit' },
      'POST /git/refs': { ref: 'refs/heads/content/space-mcp-test-orbit' },
      'POST /pulls': { html_url: 'https://github.com/o/r/pull/7' },
    };
    const fakeFetch = (async (url: string, init: RequestInit) => {
      const path = url.replace('https://api.github.com/repos/o/r', '');
      const key = `${init.method} ${path}`;
      calls.push({ method: init.method!, url: path, body: init.body ? JSON.parse(init.body as string) : undefined });
      if (!(key in responses)) return new Response('not found', { status: 404 });
      return new Response(JSON.stringify(responses[key]), { status: 200 });
    }) as typeof fetch;

    const store = new GitHubStore({ token: 't', repo: 'o/r', branch: 'main', mode: 'pull-request', fetch: fakeFetch });
    const { call } = await connect(store);
    const result = await call('submit_post', { post, media: [{ name: 'orbit.svg', svg: SVG }] });

    expect(result.text).toContain('https://github.com/o/r/pull/7');
    expect(calls.filter((c) => c.url === '/git/blobs')).toHaveLength(2);
    const tree = calls.find((c) => c.url === '/git/trees')!.body!;
    expect(tree.base_tree).toBe('base-tree');
    expect((tree.tree as { path: string }[]).map((t) => t.path)).toEqual([
      'content/posts/space/space-mcp-test-orbit.json',
      'content/media/space-mcp-test-orbit/orbit.svg',
    ]);
    expect(calls.find((c) => c.url === '/git/commits')!.body!.parents).toEqual(['base-sha']);
    expect(calls.find((c) => c.url === '/pulls')!.body).toMatchObject({ head: 'content/space-mcp-test-orbit', base: 'main' });
  });
});
