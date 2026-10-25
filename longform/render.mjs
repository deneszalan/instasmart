// Render a long-form video's scene (studio/<slug>/scene.js). Frames depend only on t.
//   node render.mjs preview <slug> t1,t2,...       PNG stills in <slug>/prev/, then the font check
//   node render.mjs video <slug> <out.mp4> <from> <to>   one chunk of the picture (run several in parallel)
//   node render.mjs scan <slug>                     draw every frame, list any that throw
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '/home/user/instasmart/node_modules/playwright-core/index.mjs';
import { covers } from '/home/user/instasmart/scripts/fonts.ts';
const here = dirname(fileURLToPath(import.meta.url));
const [mode, slug, a, b, c] = process.argv.slice(2);
const FPS = 30;
const catalog = JSON.parse(readFileSync('/home/user/instasmart/explainers/fonts/catalog.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const fonts = Object.fromEntries(Object.entries(catalog).map(([n, f]) => [n, { files: f.files.map(({ file, weight, style }) => ({ file, weight, style })) }]));
await page.addInitScript({ content: `window.FONTS = ${JSON.stringify(fonts)};` });
await page.goto(`${pathToFileURL(join(here, 'page.html')).href}?video=${slug}`);
await page.waitForFunction('"ready" in window', null, { timeout: 60000 });
await page.evaluate('window.ready');
const W = await page.evaluate('document.getElementById("c").width'), H = await page.evaluate('document.getElementById("c").height');
const png = async (t) => Buffer.from(String(await page.evaluate(`window.render(${t}), document.getElementById('c').toDataURL('image/png').split(',')[1]`)), 'base64');
const jpg = async (t) => Buffer.from(String(await page.evaluate(`window.render(${t}), document.getElementById('c').toDataURL('image/jpeg', 0.95).split(',')[1]`)), 'base64');
function glyphs() {
  return page.evaluate('[window.__drawn?.() ?? {}, window.__fontFiles ?? []]').then(([drawn, loaded]) => {
    const byFile = new Map(Object.values(catalog).flatMap((f) => f.files.map((x) => [x.file, covers(x.covers)])));
    const fb = Object.values(catalog).filter((f) => f.fallback).flatMap((f) => f.files.map((x) => covers(x.covers)));
    const out = [];
    for (const [stack, chars] of Object.entries(drawn)) {
      const names = stack.split(',').map((n) => n.trim().replace(/^["']|["']$/g, ''));
      const has = loaded.filter((f) => names.includes(f.family)).map((f) => byFile.get(f.file)).filter(Boolean);
      if (!has.length) continue;
      const lack = [...chars].filter((ch) => ch.codePointAt(0) > 0x20 && !has.some((h) => h(ch.codePointAt(0))));
      const none = lack.filter((ch) => !fb.some((h) => h(ch.codePointAt(0))));
      if (lack.length) out.push(`${stack}: ${lack.filter((ch) => !none.includes(ch)).join(' ')}${none.length ? `  NO FONT: ${none.join(' ')}` : ''}`);
    }
    return out;
  });
}
if (mode === 'preview') {
  const dir = join(here, slug, 'prev');
  mkdirSync(dir, { recursive: true });
  for (const t of a.split(',').map(Number)) writeFileSync(join(dir, `t${t.toFixed(2).padStart(7, '0')}.png`), await png(t));
  const g = await glyphs();
  console.log(`${W}×${H}: stills in ${dir}${g.length ? `\nfallback font used for: ${g.join(' | ')}` : ''}`);
} else if (mode === 'scan') {
  // Draw every frame without encoding and list the times where drawing throws (a stills check can miss them).
  const bad = await page.evaluate(`(() => { const out = []; for (let i = 0; i <= window.DURATION * ${FPS}; i++) { try { window.render(i / ${FPS}); } catch (e) { if (out.length < 8) out.push((i / ${FPS}).toFixed(2) + ' s: ' + e.message); else if (out.length === 8) out.push('…'); } } return out; })()`);
  console.log(`${slug}: ${bad.length ? 'ERRORS\n  ' + bad.join('\n  ') : 'every frame draws'}`);
  if (bad.length) process.exitCode = 1;
} else if (mode === 'video') {
  const out = a, from = Number(b), to = Math.min(Number(c), Number(await page.evaluate('window.DURATION')));
  const enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS);
  for (let i = n0; i < n1; i++) {
    if (!enc.stdin.write(await jpg(i / FPS))) await new Promise((r) => enc.stdin.once('drain', r));
    if ((i - n0) % 1800 === 0) console.log(`${out}: ${((i - n0) / FPS).toFixed(0)} of ${((n1 - n0) / FPS).toFixed(0)} s`);
  }
  enc.stdin.end();
  await new Promise((r) => enc.on('close', r));
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
await browser.close();
