import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readContentFiles } from '../scripts/disk.ts';
import type { ContentFile } from '../shared/validate.ts';
import { MEDIA_DIR, POSTS_DIR } from '../shared/validate.ts';

export interface Submission {
  /** Files to add or overwrite. */
  files: ContentFile[];
  /** Repo-relative paths to remove (stale images when a post is replaced). */
  remove: string[];
  message: string;
  title: string;
  description: string;
  branchHint: string;
}

export interface SubmitResult {
  /** "pull-request", "commit" or "local". */
  kind: 'pull-request' | 'commit' | 'local';
  url?: string;
  paths: string[];
}

/** Where submitted content goes: the local checkout, or a GitHub repository. */
export interface ContentStore {
  readonly description: string;
  /** Repo-relative paths of every file under content/posts and content/media. */
  listPaths(): Promise<string[]>;
  readText(path: string): Promise<string | null>;
  submit(submission: Submission): Promise<SubmitResult>;
}

const isContent = (path: string) => path.startsWith(`${POSTS_DIR}/`) || path.startsWith(`${MEDIA_DIR}/`);

/** Writes straight into a checkout of the repo (handy for local agents and development). */
export class LocalStore implements ContentStore {
  readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  get description() {
    return `local checkout at ${this.root}`;
  }

  async listPaths() {
    return readContentFiles(this.root).map((f) => f.path);
  }

  async readText(path: string) {
    try {
      return readFileSync(join(this.root, path), 'utf8');
    } catch {
      return null;
    }
  }

  async submit({ files, remove }: Submission): Promise<SubmitResult> {
    for (const path of remove) rmSync(join(this.root, path), { force: true });
    for (const file of files) {
      const full = join(this.root, file.path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, file.bytes);
    }
    return { kind: 'local', paths: files.map((f) => f.path) };
  }
}

export interface GitHubOptions {
  token: string;
  /** "owner/name". */
  repo: string;
  branch: string;
  /** "pull-request" opens a PR for review; "commit" commits straight to `branch`. */
  mode: 'pull-request' | 'commit';
  fetch?: typeof fetch;
  apiUrl?: string;
}

/** Commits content to GitHub through the REST API, as one commit per submission. */
export class GitHubStore implements ContentStore {
  private readonly opts: Required<GitHubOptions>;

  constructor(opts: GitHubOptions) {
    this.opts = { fetch: globalThis.fetch, apiUrl: 'https://api.github.com', ...opts };
  }

  get description() {
    const { repo, branch, mode } = this.opts;
    return mode === 'commit' ? `GitHub ${repo}, committing to ${branch}` : `GitHub ${repo}, pull requests against ${branch}`;
  }

  private async api<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.opts.fetch(`${this.opts.apiUrl}/repos/${this.opts.repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.opts.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'reckon-mcp',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new GitHubError(res.status, `${method} ${path} failed: ${res.status} ${detail.slice(0, 300)}`);
    }
    return (await res.json()) as T;
  }

  async listPaths() {
    const tree = await this.api<{ tree: { path: string; type: string }[]; truncated: boolean }>(
      'GET',
      `/git/trees/${encodeURIComponent(this.opts.branch)}?recursive=1`,
    );
    return tree.tree.filter((t) => t.type === 'blob' && isContent(t.path)).map((t) => t.path);
  }

  async readText(path: string) {
    try {
      const file = await this.api<{ content: string; encoding: string }>(
        'GET',
        `/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(this.opts.branch)}`,
      );
      return Buffer.from(file.content, 'base64').toString('utf8');
    } catch (err) {
      if (err instanceof GitHubError && err.status === 404) return null;
      throw err;
    }
  }

  async submit({ files, remove, message, title, description, branchHint }: Submission): Promise<SubmitResult> {
    const { branch, mode, repo } = this.opts;
    const ref = await this.api<{ object: { sha: string } }>('GET', `/git/ref/heads/${encodeURIComponent(branch)}`);
    const base = await this.api<{ tree: { sha: string } }>('GET', `/git/commits/${ref.object.sha}`);

    const tree = [];
    for (const file of files) {
      const blob = await this.api<{ sha: string }>('POST', '/git/blobs', {
        content: Buffer.from(file.bytes).toString('base64'),
        encoding: 'base64',
      });
      tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    for (const path of remove) tree.push({ path, mode: '100644', type: 'blob', sha: null });

    const newTree = await this.api<{ sha: string }>('POST', '/git/trees', { base_tree: base.tree.sha, tree });
    const commit = await this.api<{ sha: string }>('POST', '/git/commits', {
      message,
      tree: newTree.sha,
      parents: [ref.object.sha],
    });
    const paths = files.map((f) => f.path);

    if (mode === 'commit') {
      await this.api('PATCH', `/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha });
      return { kind: 'commit', url: `https://github.com/${repo}/commit/${commit.sha}`, paths };
    }

    let head = `content/${branchHint}`;
    try {
      await this.api('POST', '/git/refs', { ref: `refs/heads/${head}`, sha: commit.sha });
    } catch (err) {
      if (!(err instanceof GitHubError && err.status === 422)) throw err;
      head = `${head}-${Date.now().toString(36)}`;
      await this.api('POST', '/git/refs', { ref: `refs/heads/${head}`, sha: commit.sha });
    }
    const pr = await this.api<{ html_url: string }>('POST', '/pulls', { title, head, base: branch, body: description });
    return { kind: 'pull-request', url: pr.html_url, paths };
  }
}

export class GitHubError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
