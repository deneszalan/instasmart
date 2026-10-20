// Content tooling: `npm run content` (check every edition), `npm run content -- schema`,
// `npm run content -- new <field> <slug> [--edition lesefutter]`.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EDITION_IDS, EDITIONS, editionFields, type EditionId } from '../shared/editions.ts';
import { readContentFiles } from './disk.ts';
import { postJsonSchema, type Post } from '../shared/schema.ts';
import { postPath, serializePost, validateContent } from '../shared/validate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SCHEMA_PATH = 'content/schema/post.schema.json';

export function schemaText(): string {
  return `${JSON.stringify(postJsonSchema(), null, 2)}\n`;
}

function check(): number {
  let failed = 0;
  for (const id of EDITION_IDS) {
    const edition = EDITIONS[id];
    const prefix = edition.dir === '.' ? '' : `${edition.dir}/`;
    const files = readContentFiles(join(root, edition.dir));
    const { posts, problems } = validateContent(files, edition.fields);
    if (problems.length) {
      const byFile = Map.groupBy(problems, (p) => p.file);
      for (const [file, list] of byFile) {
        console.error(`\n✗ ${prefix}${file}`);
        for (const p of list) console.error(`    ${p.message}`);
      }
      console.error(`\n${edition.name}: ${problems.length} problem(s) in ${byFile.size} file(s).`);
      failed++;
      continue;
    }
    const media = files.filter((f) => f.path.startsWith('content/media/')).length;
    const perField = editionFields(edition).map((f) => `${f.id} ${posts.filter((p) => p.field === f.id).length}`).join(', ');
    console.log(`✓ ${edition.name}: ${posts.length} posts and ${media} media files are valid.\n  ${perField}`);
  }
  return failed ? 1 : 0;
}

function writeSchema(): number {
  writeFileSync(join(root, SCHEMA_PATH), schemaText());
  console.log(`Wrote ${SCHEMA_PATH}`);
  return 0;
}

function scaffold(field: string | undefined, slug: string | undefined, editionId = 'reckon'): number {
  if (!(editionId in EDITIONS)) {
    console.error(`--edition must be one of ${EDITION_IDS.join(', ')}`);
    return 1;
  }
  const edition = EDITIONS[editionId as EditionId];
  if (!field || !(edition.fields as readonly string[]).includes(field) || !slug) {
    console.error(`Usage: npm run content -- new <field> <slug> [--edition ${EDITION_IDS.join('|')}]\nFields in ${edition.name}: ${edition.fields.join(', ')}`);
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
  const relative = join(edition.dir, postPath(post));
  const path = join(root, relative);
  if (existsSync(path)) {
    console.error(`${relative} already exists`);
    return 1;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, serializePost(post));
  console.log(`Created ${relative}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command = 'check', ...rest] = process.argv.slice(2);
  const flag = rest.indexOf('--edition');
  const editionId = flag >= 0 ? rest[flag + 1] : undefined;
  const args = flag >= 0 ? rest.filter((_, i) => i !== flag && i !== flag + 1) : rest;
  const code =
    command === 'check' ? check() : command === 'schema' ? writeSchema() : command === 'new' ? scaffold(args[0], args[1], editionId) : -1;
  if (code === -1) console.error(`Unknown command "${command}". Use check, schema or new.`);
  process.exit(code === -1 ? 1 : code);
}
