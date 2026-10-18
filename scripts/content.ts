// Content tooling: `npm run content` (check), `npm run content -- schema`, `npm run content -- new <field> <slug>`.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIELD_IDS, FIELDS } from '../shared/fields.ts';
import { readContentFiles } from './disk.ts';
import { postJsonSchema, type Post } from '../shared/schema.ts';
import { postPath, serializePost, validateContent } from '../shared/validate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SCHEMA_PATH = 'content/schema/post.schema.json';

export function schemaText(): string {
  return `${JSON.stringify(postJsonSchema(), null, 2)}\n`;
}

function check(): number {
  const files = readContentFiles(root);
  const { posts, problems } = validateContent(files);
  if (problems.length) {
    const byFile = Map.groupBy(problems, (p) => p.file);
    for (const [file, list] of byFile) {
      console.error(`\n✗ ${file}`);
      for (const p of list) console.error(`    ${p.message}`);
    }
    console.error(`\n${problems.length} problem(s) in ${byFile.size} file(s).`);
    return 1;
  }
  const media = files.filter((f) => f.path.startsWith('content/media/')).length;
  const perField = FIELDS.map((f) => `${f.id} ${posts.filter((p) => p.field === f.id).length}`).join(', ');
  console.log(`✓ ${posts.length} posts and ${media} images are valid.\n  ${perField}`);
  return 0;
}

function writeSchema(): number {
  writeFileSync(join(root, SCHEMA_PATH), schemaText());
  console.log(`Wrote ${SCHEMA_PATH}`);
  return 0;
}

function scaffold(field: string | undefined, slug: string | undefined): number {
  if (!field || !(FIELD_IDS as readonly string[]).includes(field) || !slug) {
    console.error(`Usage: npm run content -- new <field> <slug>\nFields: ${FIELD_IDS.join(', ')}`);
    return 1;
  }
  const post: Post = {
    id: `${field}-${slug}`,
    field: field as Post['field'],
    title: 'A surprising, complete statement (max 90 characters)',
    emoji: '✨',
    body: 'Two to five sentences that explain why or how. Plain words, **bold** for the key idea.',
    slides: [{ type: 'text', heading: 'Going deeper', text: 'One idea per slide.' }],
    tags: ['tag'],
    source: { label: 'Wikipedia: Article title', url: 'https://en.wikipedia.org/wiki/Article_title' },
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const path = join(root, postPath(post));
  if (existsSync(path)) {
    console.error(`${postPath(post)} already exists`);
    return 1;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, serializePost(post));
  console.log(`Created ${postPath(post)}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command = 'check', ...args] = process.argv.slice(2);
  const code =
    command === 'check' ? check() : command === 'schema' ? writeSchema() : command === 'new' ? scaffold(args[0], args[1]) : -1;
  if (code === -1) console.error(`Unknown command "${command}". Use check, schema or new.`);
  process.exit(code === -1 ? 1 : code);
}
