#!/usr/bin/env node
/**
 * harness.js - 책 하나의 검증 하네스. 사용: node engine/harness.js <책 id>
 *
 * 공통 엔진 파일과 books/<id>/의 1장 1파일 소스를 검사합니다.
 * 검증 실패 시 0이 아닌 종료 코드를 반환하여 잘못된 커밋이나 빌드를 방지합니다.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = __dirname;
const BOOK_ID = process.argv[2];
if (!BOOK_ID) { console.error('사용법: node engine/harness.js <책 id>'); process.exit(2); }
const BOOK = path.join(ROOT, 'books', BOOK_ID);
const CONF = JSON.parse(fs.readFileSync(path.join(BOOK, 'book.json'), 'utf8'));
const VOLUMES_DIR = path.join(BOOK, 'volumes');
const RAG_STUDY = path.resolve(ROOT, '..', 'rag-study');

let errorCount = 0;
function logPass(msg) { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }
function logFail(msg) { console.error(`\x1b[31m✗\x1b[0m ${msg}`); errorCount++; }

console.log('========================================');
console.log(`검증 하네스: ${BOOK_ID}`);
console.log('========================================\n');

// 1. 공통 파일 존재 및 구문 검사
const coreFiles = [
  path.join(ENGINE, 'core', 'styles.css'),
  path.join(ENGINE, 'core', 'api.js'),
  path.join(ENGINE, 'core', 'components.js'),
  path.join(ENGINE, 'core', 'runtime.js'),
  path.join(ENGINE, 'vendor', 'three.min.js'),
  path.join(BOOK, 'book_cover.js')
];

coreFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    logFail(`공통 핵심 파일 누락: ${path.relative(ROOT, file)}`);
  } else {
    logPass(`핵심 파일 확인: ${path.relative(ROOT, file)}`);
  }
});

// 공통 컴포넌트 평가
const componentsCode = fs.readFileSync(path.join(ENGINE, 'core', 'components.js'), 'utf8')
  .replace(/export\s+const\s+/g, 'const ');

const sandbox = {
  BOOKS: [],
  makeThree: () => null,
  clamp: v => v,
  ease: x => x,
  seg: () => 0,
  lerp: (a, b, p) => a + (b - a) * p,
  console
};
vm.createContext(sandbox);
vm.runInContext(componentsCode, sandbox);

// 표지 설정: 런타임이 읽는 문구가 모두 있어야 한다
try {
  const cover = fs.readFileSync(path.join(BOOK, 'book_cover.js'), 'utf8').replace(/export\s+const\s+/g, 'const ');
  const BOOK_COVER = vm.runInContext(`${cover}\nBOOK_COVER`, sandbox);
  const need = ['coverLeft', 'coverRight', 'coverBadge', 'runhead', 'labLabel', 'outroLeft', 'outroTag', 'outroTitle', 'outroBody'];
  const miss = ['title', 'storageKey', 'color', 'text'].filter(k => !BOOK_COVER[k])
    .concat(need.filter(k => !(BOOK_COVER.text || {})[k]).map(k => 'text.' + k));
  if (/[—–]/.test(cover)) logFail('book_cover.js: 긴 대시(—, –) 사용 금지 위반');
  if (miss.length) logFail(`book_cover.js 누락: ${miss.join(', ')}`); else logPass('book_cover.js 표지 설정 확인');
} catch (e) { logFail(`book_cover.js 파싱 오류: ${e.message}`); }

// 2. 권 및 1장 1파일 구조 정밀 검증
const volDirs = fs.readdirSync(VOLUMES_DIR)
  .filter(d => d.startsWith('vol'))
  .sort((a, b) => parseInt(a.replace('vol', '')) - parseInt(b.replace('vol', '')));

logPass(`총 ${volDirs.length}개 권 디렉토리 감지`);

volDirs.forEach(vDir => {
  const vPath = path.join(VOLUMES_DIR, vDir);
  const vNum = parseInt(vDir.replace('vol', ''));
  console.log(`\n[검증] ${vDir} 점검...`);

  const metaFile = path.join(vPath, 'meta.js');
  const recapFile = path.join(vPath, 'recap.js');

  if (!fs.existsSync(metaFile)) logFail(`${vDir}/meta.js 파일 누락`);
  if (!fs.existsSync(recapFile)) logFail(`${vDir}/recap.js 파일 누락`);

  // 장 파일들 수집
  let chapIdx = 1;
  const chaps = [];
  while (fs.existsSync(path.join(vPath, `chap${chapIdx}.js`))) {
    const cFile = path.join(vPath, `chap${chapIdx}.js`);
    const cContent = fs.readFileSync(cFile, 'utf8');

    // 규칙 검사 1: 긴 대시 금지 (—, –)
    if (/[—–]/.test(cContent)) {
      logFail(`${vDir}/chap${chapIdx}.js: 긴 대시(—, –) 사용 금지 위반`);
    }

    // 파일 구문 검사 (export default -> 객체)
    let rawObj = cContent.replace(/^export default\s*/, '').replace(/;\s*$/, '');
    try {
      const parsedChap = vm.runInContext(`(${rawObj})`, sandbox);
      // 필드 무결성 검증
      if (!parsedChap.title) logFail(`${vDir}/chap${chapIdx}.js: title 누락`);
      if (!parsedChap.tag) logFail(`${vDir}/chap${chapIdx}.js: tag 누락`);
      if (!parsedChap.lead) logFail(`${vDir}/chap${chapIdx}.js: lead 누락`);
      if (!parsedChap.body) logFail(`${vDir}/chap${chapIdx}.js: body 누락`);
      if (!parsedChap.lab) logFail(`${vDir}/chap${chapIdx}.js: lab 누락`);
      if (!parsedChap.quiz || !parsedChap.quiz.q || !parsedChap.quiz.options) {
        logFail(`${vDir}/chap${chapIdx}.js: quiz 형식 오류`);
      } else if (parsedChap.quiz.answer < 0 || parsedChap.quiz.answer >= parsedChap.quiz.options.length) {
        logFail(`${vDir}/chap${chapIdx}.js: quiz.answer 인덱스 범위 초과`);
      }
      if (typeof parsedChap.scene !== 'function') {
        logFail(`${vDir}/chap${chapIdx}.js: scene 함수 누락`);
      }
      logPass(`${vDir} ${chapIdx}장: "${parsedChap.title}" 유효성 통과`);
    } catch (e) {
      logFail(`${vDir}/chap${chapIdx}.js 파싱 오류: ${e.message}`);
    }

    // 규칙 검사 2: 본문이 가리키는 실습 파일(rag-study/...)이 실제로 있어야 한다
    // rag-study는 이 저장소 밖(형제 폴더)에 있어서, 없을 때(GitHub Actions)는 건너뛴다
    if (fs.existsSync(RAG_STUDY)) for (const m of cContent.matchAll(/rag-study\/([\w./-]+\.(?:py|md|json))/g)) {
      if (!fs.existsSync(path.join(RAG_STUDY, m[1]))) {
        logFail(`${vDir}/chap${chapIdx}.js: 없는 실습 파일 rag-study/${m[1]}`);
      }
    }

    chaps.push(rawObj);
    chapIdx++;
  }

  const minChapters = CONF.minChapters || 1;
  if (chaps.length < minChapters) {
    logFail(`${vDir}: 최소 ${minChapters}장 이상이어야 합니다 (현재 ${chaps.length}장)`);
  }

  // 권 전체 재조립 실행 검증
  try {
    const meta = fs.readFileSync(metaFile, 'utf8');
    const recap = fs.readFileSync(recapFile, 'utf8');
    const fullVolCode = `${meta}\n  chapters: [\n${chaps.join(',\n')}\n  ],\n  ${recap}`;
    vm.runInContext(fullVolCode, sandbox);
    logPass(`${vDir} 전체 재조립 및 BOOKS 등록 성공`);
  } catch (e) {
    logFail(`${vDir} 통합 실행 오류: ${e.message}`);
  }
});

console.log('\n========================================');
if (errorCount === 0) {
  console.log('🎉 하네스 검증 100% 성공! (오류 0건)');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.error(`💥 하네스 검증 실패: 총 ${errorCount}건의 문제 발견`);
  console.log('========================================\n');
  process.exit(1);
}
