// The explainer font library: explainers/fonts/ holds complete fonts (every character the family has, not
// a web subset), described in explainers/fonts/families.json. This script reads every font file and writes
//   explainers/fonts/catalog.json  what Kit loads by family name, and the characters each file covers
//   explainers/fonts/README.md     the list writers choose fonts from
//
//   npm run fonts            regenerate both after adding or changing a font
//   npm run fonts -- check   exit 1 if either is out of date (the test runs this)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'explainers', 'fonts');

// ---------- reading a font file (WOFF2, TTF or OTF): just the tables we need ----------
const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC',
  'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar',
  'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

function fontTables(buf: Buffer): Map<string, Buffer> {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') {
    // a plain TrueType/OpenType file: a table directory of (tag, checksum, offset, length)
    const tables = new Map<string, Buffer>();
    for (let i = 0, n = buf.readUInt16BE(4); i < n; i++) {
      const r = 12 + i * 16;
      tables.set(buf.toString('latin1', r, r + 4), buf.subarray(buf.readUInt32BE(r + 8), buf.readUInt32BE(r + 8) + buf.readUInt32BE(r + 12)));
    }
    return tables;
  }
  const numTables = buf.readUInt16BE(12), compressed = buf.readUInt32BE(20);
  let p = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const b = buf[p++]; v = v * 128 + (b & 0x7f); if (!(b & 0x80)) return v; } throw new Error('bad UIntBase128'); };
  const dirEntries: { tag: string; length: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[p++];
    const tag = (flags & 0x3f) === 0x3f ? buf.toString('latin1', p, (p += 4)) : KNOWN[flags & 0x3f];
    const version = flags >> 6;
    const orig = base128();
    // glyf and loca are transformed unless version 3; every other table only when version is not 0
    const transformed = tag === 'glyf' || tag === 'loca' ? version !== 3 : version !== 0;
    const length = transformed ? base128() : orig;
    dirEntries.push({ tag, length });
  }
  const data = brotliDecompressSync(buf.subarray(p, p + compressed));
  const tables = new Map<string, Buffer>();
  let off = 0;
  for (const { tag, length } of dirEntries) { tables.set(tag, data.subarray(off, off + length)); off += length; }
  return tables;
}

/** Code points a font maps, from its best cmap subtable (format 12, else 4). */
function cmapPoints(t: Buffer): Set<number> {
  const n = t.readUInt16BE(2), subs: { pid: number; eid: number; off: number; fmt: number }[] = [];
  for (let i = 0; i < n; i++) { const pid = t.readUInt16BE(4 + i * 8), eid = t.readUInt16BE(6 + i * 8), off = t.readUInt32BE(8 + i * 8); subs.push({ pid, eid, off, fmt: t.readUInt16BE(off) }); }
  const pick = subs.find((s) => s.fmt === 12) ?? subs.find((s) => s.fmt === 4 && s.pid === 3) ?? subs.find((s) => s.fmt === 4);
  const out = new Set<number>();
  if (!pick) return out;
  const o = pick.off;
  if (pick.fmt === 12) {
    const groups = t.readUInt32BE(o + 12);
    for (let i = 0; i < groups; i++) { const a = t.readUInt32BE(o + 16 + i * 12), b = t.readUInt32BE(o + 20 + i * 12); for (let c = a; c <= b; c++) out.add(c); }
  } else {
    const segX2 = t.readUInt16BE(o + 6), ends = o + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = t.readUInt16BE(ends + s * 2), start = t.readUInt16BE(starts + s * 2), delta = t.readInt16BE(deltas + s * 2), ro = t.readUInt16BE(ranges + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        const glyph = ro === 0 ? (c + delta) & 0xffff : t.readUInt16BE(ranges + s * 2 + ro + (c - start) * 2);
        if (glyph) out.add(c);
      }
    }
  }
  return out;
}

function nameOf(t: Buffer, id: number): string | undefined {
  const count = t.readUInt16BE(2), strings = t.readUInt16BE(4);
  let found: string | undefined;
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12, pid = t.readUInt16BE(r), lang = t.readUInt16BE(r + 4), nid = t.readUInt16BE(r + 6), len = t.readUInt16BE(r + 8), off = t.readUInt16BE(r + 10);
    if (nid !== id || pid !== 3) continue;
    const raw = t.subarray(strings + off, strings + off + len);
    const s = Buffer.from(raw).swap16().toString('utf16le');
    if (lang === 0x409) return s;
    found ??= s;
  }
  return found;
}

/** Code points as compact ranges: "20-7E,A0-17F". */
function ranges(points: Set<number>): string {
  const sorted = [...points].sort((a, b) => a - b), out: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    const hex = (n: number) => n.toString(16).toUpperCase();
    out.push(i === j ? hex(sorted[i]) : `${hex(sorted[i])}-${hex(sorted[j])}`);
    i = j;
  }
  return out.join(',');
}
export function covers(r: string): (cp: number) => boolean {
  const spans = r.split(',').map((s) => s.split('-').map((h) => parseInt(h, 16))).map(([a, b = a]) => [a, b]);
  return (cp) => spans.some(([a, b]) => cp >= a && cp <= b);
}

// ---------- the catalogue ----------
interface FileInfo { file: string; weight: string; style: 'normal' | 'italic'; covers: string }
interface Family { about: string; kind: string; fallback?: boolean; files: FileInfo[]; scripts: string[]; symbols: string[] }

/** Character sets writers ask about, each tested by a few representative characters. */
const SCRIPTS: [string, string][] = [['Latin', 'AZaz'], ['Western European (é ö ß)', 'éöüßçñ'], ['Central European (ő ć ł ž)', 'őćłžęš'],
  ['Baltic and more Latin (ē ū ī ā)', 'ēūīāņļ'], ['Vietnamese', 'ạầệố'], ['Greek', 'ΑΩαβπ'], ['Cyrillic', 'АЯаяж'], ['IPA', 'ɛɔʊɪəʃ']];
const SYMBOLS: [string, string][] = [['arrows → ←', '→←↑↓'], ['math − × ÷ ≈ ≤', '−×÷≈≤≥'], ['π √', 'π√'], ['fractions ⅓ ⅔', '⅓⅔¼'],
  ['subscripts ₁ ₂', '₀₁₂₃'], ['superscripts ² ³', '²³'], ['check ✓', '✓']];

export function buildCatalog(): { catalog: Record<string, Family>; readme: string } {
  const about = JSON.parse(readFileSync(join(dir, 'families.json'), 'utf8')) as Record<string, { about: string; kind: string; fallback?: boolean }>;
  const families: Record<string, Family> = {};
  for (const file of readdirSync(dir).filter((f) => /\.(woff2|ttf|otf)$/.test(f)).sort()) {
    const tables = fontTables(readFileSync(join(dir, file)));
    const name = tables.get('name')!, os2 = tables.get('OS/2')!, fvar = tables.get('fvar');
    const family = nameOf(name, 16) ?? nameOf(name, 1)!;
    let weight = String(os2.readUInt16BE(4));
    if (fvar) {
      const axes = fvar.readUInt16BE(4), count = fvar.readUInt16BE(8), size = fvar.readUInt16BE(10);
      for (let i = 0; i < count; i++) {
        const a = axes + i * size;
        if (fvar.toString('latin1', a, a + 4) === 'wght') weight = `${fvar.readInt32BE(a + 4) / 65536} ${fvar.readInt32BE(a + 12) / 65536}`;
      }
    }
    const style = os2.readUInt16BE(62) & 1 ? 'italic' : 'normal';
    const points = cmapPoints(tables.get('cmap')!);
    const info = about[family];
    if (!info) throw new Error(`${file}: family "${family}" is not described in explainers/fonts/families.json`);
    const fam = (families[family] ??= { about: info.about, kind: info.kind, ...(info.fallback ? { fallback: true } : {}), files: [], scripts: [], symbols: [] });
    fam.files.push({ file, weight, style, covers: ranges(points) });
  }
  for (const [name, fam] of Object.entries(families)) {
    const all = (s: string) => [...s].every((c) => fam.files.some((f) => covers(f.covers)(c.codePointAt(0)!)));
    fam.scripts = SCRIPTS.filter(([, s]) => all(s)).map(([n]) => n);
    fam.symbols = SYMBOLS.filter(([, s]) => all(s)).map(([n]) => n);
    if (!(name in about)) throw new Error(name);
  }
  for (const name of Object.keys(about)) if (!families[name]) throw new Error(`families.json describes "${name}", but no font file has that family`);
  const weights = (f: Family) => [...new Set(f.files.map((x) => x.weight))].sort((a, b) => parseFloat(a) - parseFloat(b)).map((w) => w.replace(' ', '–')).join(', ') +
    (f.files.some((x) => x.style === 'italic') ? ', italic' : '');
  const rows = Object.entries(families).filter(([, f]) => !f.fallback).sort(([a], [b]) => a.localeCompare(b))
    .map(([n, f]) => `| ${n} | ${f.kind} | ${f.about} | ${weights(f)} | ${f.scripts.slice(1).join('; ') || '—'} | ${f.symbols.join('; ') || '—'} |`);
  const fb = Object.entries(families).filter(([, f]) => f.fallback).map(([n]) => n).join(', ');
  const readme = `# Explainer fonts

Written by \`npm run fonts\` from the font files and \`families.json\`; don't edit it by hand.

Choose a scene's fonts from this list and load them by name: \`Kit.scene({ fonts: ['Bungee', 'Barlow'], … })\` loads every weight and style
of each family. Every scene also gets ${fb} behind its own fonts, so a character its fonts lack is still drawn in a designed face; the
render lists any character no font has. Each family's licence (SIL Open Font License) is next to its files.

To add a family: put its complete font files here (from github.com/google/fonts, not a web subset), preferably as \`.woff2\`, with its licence
file, describe it in \`families.json\` and run \`npm run fonts\`.

| Family | Kind | Character | Weights | Beyond basic Latin | Symbols |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
  return { catalog: families, readme };
}

function main(): number {
  const { catalog, readme } = buildCatalog();
  const json = `${JSON.stringify(catalog, null, 1)}\n`;
  const files: [string, string][] = [[join(dir, 'catalog.json'), json], [join(dir, 'README.md'), readme]];
  if (process.argv[2] === 'check') {
    const stale = files.filter(([p, s]) => { try { return readFileSync(p, 'utf8') !== s; } catch { return true; } });
    for (const [p] of stale) console.error(`${p.slice(root.length + 1)} is out of date: run npm run fonts`);
    return stale.length ? 1 : 0;
  }
  for (const [p, s] of files) writeFileSync(p, s);
  console.log(`${Object.keys(catalog).length} families, ${Object.values(catalog).reduce((n, f) => n + f.files.length, 0)} files`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main());
