#!/usr/bin/env node
/**
 * build.js - 책 하나(또는 전부)를 단일 HTML로 묶어 dist/에 둔다.
 *
 *   node engine/build.js            # books/ 아래 모든 책 + 책 목록(dist/index.html)
 *   node engine/build.js ax cesco   # 고른 책만 (목록은 dist/에 있는 책으로 다시 만든다)
 *
 * 결과: dist/<id>/index.html (책 하나 = 폴더 하나), dist/index.html (책 목록)
 * GitHub Pages는 dist/를 그대로 올린다 (.github/workflows/pages.yml).
 *
 * 책 폴더 구성 (books/<id>/):
 *   book.json      { "title", "blurb", "order", "minChapters" } 또는 옛 엔진 책은 "minChapters" 대신 "legacy": "build/build.py"
 *   book_cover.js  BOOK_COVER (표지, 색, 문구 text, storageKey)
 *   volumes/volN/  meta.js, chap1.js ~, recap.js
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = __dirname;
const BOOKS_DIR = path.join(ROOT, 'books');
const DIST = path.join(ROOT, 'dist');

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const stripExport = s => s.replace(/export\s+const\s+/g, 'const ');

function listBooks() {
  return fs.readdirSync(BOOKS_DIR).filter(d => fs.existsSync(path.join(BOOKS_DIR, d, 'book.json'))).sort();
}

const outFile = id => path.join(DIST, id, 'index.html');

function buildLegacy(id, conf) {
  const script = path.join(BOOKS_DIR, id, conf.legacy);
  execFileSync('python3', ['-I', script, outFile(id)], { stdio: 'inherit' });
}

function buildBook(id) {
  const dir = path.join(BOOKS_DIR, id);
  const conf = JSON.parse(read(dir, 'book.json'));
  if (conf.legacy) return buildLegacy(id, conf);

  execFileSync('node', [path.join(ENGINE, 'harness.js'), id], { stdio: 'inherit' });

  const volsDir = path.join(dir, 'volumes');
  const visible = fs.readdirSync(volsDir).filter(d => /^vol\d+$/.test(d))
    .map(d => +d.slice(3)).sort((a, b) => a - b);

  const volumesCode = visible.map(v => {
    const vDir = path.join(volsDir, `vol${v}`);
    const chaps = [];
    for (let i = 1; fs.existsSync(path.join(vDir, `chap${i}.js`)); i++) {
      chaps.push(read(vDir, `chap${i}.js`).replace(/^export default\s*/, '').replace(/;\s*$/, ''));
    }
    return `${read(vDir, 'meta.js')}\n  chapters: [\n${chaps.join(',\n')}\n  ],\n  ${read(vDir, 'recap.js')}`;
  }).join('\n\n');

  const three = read(ENGINE, 'vendor', 'three.min.js').replace(/<\/script/g, '<\\/script');
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${conf.title}</title>
<style>
${read(ENGINE, 'core', 'styles.css')}
</style>
</head>
<body>
<div class="shell">
  <nav class="shelf" id="shelf" aria-label="권 고르기"></nav>
  <div class="book" id="book" aria-live="polite"></div>
  <div class="nav">
    <button class="btn" id="home">⌂ 표지</button>
    <button class="btn" id="prev">← 이전</button>
    <div class="dots" id="dots"></div>
    <span class="count" id="count"></span>
    <button class="btn" id="next">다음 →</button>
  </div>
</div>
<script>${three}</script>
<script>
${read(ENGINE, 'core', 'api.js')}
${stripExport(read(ENGINE, 'core', 'components.js'))}
${stripExport(read(dir, 'book_cover.js'))}
${volumesCode}
${read(ENGINE, 'core', 'runtime.js')}
</script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(outFile(id)), { recursive: true });
  fs.writeFileSync(outFile(id), html, 'utf8');
  console.log(`빌드 완료: dist/${id}/index.html (${Math.round(html.length / 1024)}KB, ${visible.length}권)\n`);
}

// 책 목록: dist/<id>/index.html이 있는 책만 싣는다
function buildIndex() {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const books = listBooks().filter(id => fs.existsSync(outFile(id)))
    .map(id => ({ id, ...JSON.parse(read(BOOKS_DIR, id, 'book.json')) }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const cards = books.map(b => `    <a class="card" href="./${encodeURIComponent(b.id)}/">
      <b>${esc(b.title)}</b>
      <span>${esc(b.blurb || '')}</span>
      <small>/${esc(b.id)}/</small>
    </a>`).join('\n');
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>가이드북</title>
<style>
  :root { --ink: #23272f; --muted: #6b7280; --line: #e4e1d8; --paper: #f6f4ee; --accent: #2f5fd0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 48px 16px; }
  h1 { font-size: 26px; margin: 0 0 6px; }
  p.lead { color: var(--muted); margin: 0 0 28px; }
  .card { display: grid; gap: 4px; padding: 18px 20px; margin-bottom: 12px; background: #fff; border: 1px solid var(--line); border-radius: 14px; color: inherit; text-decoration: none; }
  .card:hover { border-color: var(--accent); }
  .card b { font-size: 17px; }
  .card span { color: var(--muted); font-size: 14px; }
  .card small { color: var(--accent); font-size: 12px; }
</style>
</head>
<body>
<main>
  <h1>가이드북</h1>
  <p class="lead">책 ${books.length}권</p>
${cards}
</main>
</body>
</html>
`;
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
  console.log(`책 목록: dist/index.html (${books.length}권)`);
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : listBooks();
for (const id of ids) {
  if (!fs.existsSync(path.join(BOOKS_DIR, id, 'book.json'))) {
    console.error(`없는 책: ${id} (books/${id}/book.json)`);
    process.exit(1);
  }
  console.log(`== ${id}`);
  buildBook(id);
}
buildIndex();
