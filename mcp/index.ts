#!/usr/bin/env node
// Reckon MCP server: lets LLM clients publish posts to the app's content repository.
//
//   node mcp/index.ts                 stdio (Claude Desktop, Claude Code, …)
//   node mcp/index.ts --http          Streamable HTTP on $PORT (default 8788) at /mcp
//
// Where posts go:
//   RECKON_GITHUB_TOKEN + RECKON_GITHUB_REPO  → GitHub (pull requests by default)
//   otherwise                                          → this checkout's content/ folder
import { createServer as createHttpServer, type IncomingMessage } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.ts';
import { GitHubStore, LocalStore, type ContentStore } from './stores.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;

/** RECKON_* settings, still honouring the INSTASMART_* names from before the rename. */
const setting = (name: string): string | undefined => env[`RECKON_${name}`] ?? env[`INSTASMART_${name}`];

function makeStore(): ContentStore {
  const token = setting('GITHUB_TOKEN');
  const repo = setting('GITHUB_REPO');
  if (token && repo) {
    return new GitHubStore({
      token,
      repo,
      branch: setting('GITHUB_BRANCH') || 'main',
      mode: setting('PUBLISH_MODE') === 'commit' ? 'commit' : 'pull-request',
    });
  }
  if (token || repo) throw new Error('Set both RECKON_GITHUB_TOKEN and RECKON_GITHUB_REPO, or neither for local mode.');
  return new LocalStore(setting('CONTENT_ROOT') || root);
}

function bearerMatches(req: IncomingMessage, expected: string): boolean {
  const header = req.headers.authorization ?? '';
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

async function readBody(req: IncomingMessage, limit: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new Error('Request body too large');
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
}

async function main() {
  const store = makeStore();

  if (!process.argv.includes('--http')) {
    await createServer(store, root).connect(new StdioServerTransport());
    console.error(`Reckon MCP server on stdio → ${store.description}`);
    return;
  }

  const token = env.MCP_AUTH_TOKEN;
  if (!token || token.length < 16) throw new Error('HTTP mode needs MCP_AUTH_TOKEN (at least 16 characters).');
  const port = Number(env.PORT || 8788);

  const http = createHttpServer(async (req, res) => {
    const json = (status: number, body: unknown, headers: Record<string, string> = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers }).end(JSON.stringify(body));
    };
    if (new URL(req.url ?? '/', 'http://localhost').pathname !== '/mcp') return json(404, { error: 'Not found' });
    if (!bearerMatches(req, token)) return json(401, { error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
    // Stateless server: every request is a complete JSON-RPC exchange, so there is no SSE stream to GET.
    if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });

    try {
      const body = await readBody(req, 12 * 1024 * 1024);
      const server = createServer(store, root);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      if (!res.headersSent) json(400, { error: (err as Error).message });
    }
  });

  http.listen(port, () => console.error(`Reckon MCP server on http://localhost:${port}/mcp → ${store.description}`));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
