#!/usr/bin/env node
// ストア入力文言の文字数カウンタ。
//
// docs/apps/<app>/draft-spec/store-copy/{appstore,googleplay}-*.md と
// docs/apps/_template/store-listing/*.md を走査し、各見出し直下のコードブロック
// （＝コンソールへコピペする原文）を抽出して文字数を数える。App Store /
// Google Play の各項目の文字数上限と突き合わせ、超過を赤字で報告する。
//
// 使い方:
//   node scripts/store-char-count.mjs            全ストアファイルを走査
//   node scripts/store-char-count.mjs <file...>  指定ファイルだけ数える
//   node scripts/store-char-count.mjs --json      機械可読な JSON で出力
//
// 文字数は Unicode コードポイント数（[...str].length）で数える。ストアは
// おおむねコードポイント単位で数えるため、絵文字や日本語も 1 文字扱いになる。
// Google Play の詳細説明などは <b> などの書式タグも上限に含まれるため、
// 生の文字数を正とし、タグを除いた「表示文字数」は参考値として併記する。

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- 文字数上限の定義 ------------------------------------------------------
// 見出し名（正規化後）→ 上限。null は上限なし（カウントのみ）。
const APPSTORE_LIMITS = {
  'app name': 30,
  subtitle: 30,
  'promotional text': 170,
  keywords: 100,
  description: 4000,
};
const GOOGLEPLAY_LIMITS = {
  // 日本語
  'タイトル': 30,
  '短い説明': 80,
  '詳細説明': 4000,
  // 英語
  title: 30,
  'short description': 80,
  'full description': 4000,
  description: 4000,
  // 繁体字
  '標題': 30,
  '短說明': 80,
  '簡短說明': 80,
  '完整說明': 4000,
  '詳細說明': 4000,
};
// In-App Purchase / ストアアイテム配下の項目（App Store / Google Play 共通の目安）。
const IAP_LIMITS = {
  'display name': 30,
  description: 45,
};

// --- 引数処理 --------------------------------------------------------------
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const fileArgs = args.filter((a) => !a.startsWith('--'));

// --- 対象ファイルの収集 ----------------------------------------------------
function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'build') continue;
      walk(full, acc);
    } else if (isStoreFile(full)) {
      acc.push(full);
    }
  }
  return acc;
}

function isStoreFile(path) {
  const p = path.replace(/\\/g, '/');
  if (!/\/(store-copy|store-listing)\//.test(p)) return false;
  const base = basename(p);
  return /^(appstore|googleplay)-[a-z]+\.md$/.test(base);
}

function collectFiles() {
  if (fileArgs.length > 0) {
    return fileArgs.map((f) => (f.match(/^([a-zA-Z]:)?[\\/]/) ? f : join(process.cwd(), f)));
  }
  return walk(join(ROOT, 'docs', 'apps'), []).sort();
}

// --- パース ----------------------------------------------------------------
// 各見出し直下のコードブロックを (h2, h3) と紐づけて取り出す。
function parseFields(text) {
  const lines = text.split(/\r?\n/);
  const fields = [];
  let h2 = null;
  let h3 = null;
  let inFence = false;
  let buf = null;
  let ownerH2 = null;
  let ownerH3 = null;

  // frontmatter (先頭の --- ブロック) を飛ばす。
  let start = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end !== -1) start = end + 1;
  }

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^```/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        buf = [];
        ownerH2 = h2;
        ownerH3 = h3;
      } else {
        inFence = false;
        fields.push({ h2: ownerH2, h3: ownerH3, value: buf.join('\n') });
        buf = null;
      }
      continue;
    }
    if (inFence) {
      buf.push(line);
      continue;
    }
    const m3 = line.match(/^###\s+(.*)$/);
    const m2 = line.match(/^##\s+(.*)$/);
    if (m3) {
      h3 = m3[1].trim();
    } else if (m2) {
      h2 = m2[1].trim();
      h3 = null;
    }
  }
  return fields;
}

function normHeading(h) {
  return (h || '').toLowerCase().trim();
}

function resolveLimit(store, h2, h3) {
  const isIap = /in-app purchase|iap|ストアアイテム/i.test(h2 || '');
  const key = normHeading(h3 || h2);
  if (isIap) {
    return { name: h3 || h2, limit: IAP_LIMITS[key] ?? null };
  }
  const table = store === 'appstore' ? APPSTORE_LIMITS : GOOGLEPLAY_LIMITS;
  const raw = h3 || h2;
  const nk = raw ? raw.trim() : '';
  const limit = table[key] ?? table[nk] ?? null;
  return { name: raw, limit };
}

const cp = (s) => [...s].length; // コードポイント数
const stripTags = (s) => s.replace(/<[^>]+>/g, '');

// --- 実行 ------------------------------------------------------------------
const files = collectFiles();
const report = [];
let overCount = 0;

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (e) {
    console.error(`読み込み失敗: ${file}: ${e.message}`);
    continue;
  }
  const store = /googleplay-/.test(basename(file)) ? 'googleplay' : 'appstore';
  const fields = parseFields(text).map((f) => {
    const { name, limit } = resolveLimit(store, f.h2, f.h3);
    const value = f.value.replace(/^\n+|\n+$/g, '');
    const count = cp(value);
    const stripped = cp(stripTags(value));
    const over = limit != null && count > limit;
    if (over) overCount++;
    return {
      name,
      section: f.h3 ? `${f.h2} › ${f.h3}` : f.h2,
      count,
      stripped: stripped !== count ? stripped : null,
      limit,
      over,
    };
  });
  report.push({ file: relative(ROOT, file).replace(/\\/g, '/'), store, fields });
}

if (asJson) {
  console.log(JSON.stringify({ overCount, files: report }, null, 2));
  process.exit(overCount > 0 ? 1 : 0);
}

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const supportsColor = process.stdout.isTTY;
const c = (code, s) => (supportsColor ? code + s + RESET : s);

for (const r of report) {
  console.log(`\n${c(BOLD, r.file)}`);
  if (r.fields.length === 0) {
    console.log(c(DIM, '  コードブロックが見つかりません'));
    continue;
  }
  const nameW = Math.max(...r.fields.map((f) => cp(f.name || '')), 10);
  for (const f of r.fields) {
    const name = (f.name || '(no heading)').padEnd(nameW);
    const limitStr = f.limit != null ? `/ ${f.limit}` : c(DIM, '(上限なし)');
    let status;
    if (f.limit == null) status = '';
    else if (f.over) status = c(RED, `  ✗ ${f.count - f.limit} 超過`);
    else status = c(GREEN, '  ✓');
    const strippedNote = f.stripped != null ? c(DIM, ` (表示 ${f.stripped})`) : '';
    const countStr = f.over ? c(RED, String(f.count)) : String(f.count);
    console.log(`  ${name}  ${countStr.padStart(5)} ${limitStr}${strippedNote}${status}`);
  }
}

console.log('');
if (overCount > 0) {
  console.log(c(RED, `文字数超過: ${overCount} 項目`));
  process.exit(1);
} else {
  console.log(c(GREEN, 'すべて上限内'));
}
