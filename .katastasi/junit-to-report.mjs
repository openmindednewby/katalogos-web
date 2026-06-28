#!/usr/bin/env node
// Katastasi status-hub reporter — converts test results into a TraceReport the
// collector at https://status.dloizides.com/ingest understands.
//
// Reads JUnit XML (jest / vitest reporters) and/or dotnet TRX files, turns each
// test case into one requirement, and emits a TraceReport JSON whose headline
// stats mirror the status-hub feeder contract: verified=passed, failing=failed,
// unverified=skipped, total=passed+failed, coveragePct=round(verified/total*100).
//
// No dependencies (Node 18+). Usage:
//   node junit-to-report.mjs --project <slug> --out <file> <result-file> [more files...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const argv = process.argv.slice(2);
let project = 'unknown';
let out = '.katastasi/report.json';
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--project') project = argv[++i];
  else if (argv[i] === '--out') out = argv[++i];
  else files.push(argv[i]);
}

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
const dec = (s) => s.replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENT[m]);
const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  return m ? dec(m[1]) : '';
};

function parseJUnit(xml) {
  const cases = [];
  const re = /<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    const tag = m[1];
    const inner = m[3] ?? '';
    const cls = attr(tag, 'classname');
    const nm = attr(tag, 'name');
    const name = `${cls} ${nm}`.trim() || nm || cls || 'test';
    let status = 'passed';
    if (/<(failure|error)\b/i.test(inner)) status = 'failed';
    else if (/<skipped\b/i.test(inner)) status = 'skipped';
    cases.push({ name, status });
  }
  return cases;
}

const TRX = { passed: 'passed', failed: 'failed', error: 'failed', timeout: 'failed', notexecuted: 'skipped', skipped: 'skipped', inconclusive: 'skipped', pending: 'skipped' };
function parseTrx(xml) {
  const cases = [];
  const re = /<UnitTestResult\b([^>]*?)\/?>/g;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    const tag = m[1];
    const name = attr(tag, 'testName');
    const status = TRX[(attr(tag, 'outcome') || '').toLowerCase()] ?? 'skipped';
    if (name) cases.push({ name, status });
  }
  return cases;
}

const tests = [];
for (const f of files) {
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }
  const isTrx = /\.trx$/i.test(f) || /<TestRun\b/.test(text);
  for (const t of (isTrx ? parseTrx(text) : parseJUnit(text))) tests.push(t);
}

const STATE = { passed: 'verified', failed: 'failing', skipped: 'unverified' };
const seen = new Map();
const requirements = tests.map((t, i) => {
  let base = (t.name.match(/[A-Za-z0-9][A-Za-z0-9_.\- ]{0,60}/)?.[0] ?? `T${i + 1}`).trim().replace(/\s+/g, '-').toUpperCase();
  let key = base;
  if (seen.has(base)) { const n = seen.get(base) + 1; seen.set(base, n); key = `${base}-${n}`; } else seen.set(base, 1);
  return {
    key, title: t.name, declaredStatus: null, declaredComplete: false, source: 'markdown',
    state: STATE[t.status], drift: false, stale: false, inCode: null,
    tests: [{ key, file: 'tests', title: t.name, tech: 'generic', via: 'mapping' }],
    result: { passed: t.status === 'passed' ? 1 : 0, failed: t.status === 'failed' ? 1 : 0, skipped: t.status === 'skipped' ? 1 : 0, lastRun: new Date().toISOString() },
  };
});

const passed = tests.filter((t) => t.status === 'passed').length;
const failed = tests.filter((t) => t.status === 'failed').length;
const skipped = tests.filter((t) => t.status === 'skipped').length;
const total = passed + failed;
const stats = {
  total, verified: passed, failing: failed, unverified: skipped, specified: requirements.length,
  drift: 0, orphanTests: 0, stale: 0, implemented: 0, regressions: 0,
  coveragePct: total > 0 ? Math.round((passed / total) * 100) : 0,
};
const sha = process.env.GITHUB_SHA || null;
const report = {
  generatedAt: new Date().toISOString(), project,
  git: { sha, shortSha: sha ? sha.slice(0, 7) : null, branch: process.env.GITHUB_REF_NAME || null, dirty: false, committedAt: null },
  requirements, orphanTests: [], stats,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2));
console.error(`katastasi: ${project} -> ${passed} passed, ${failed} failed, ${skipped} skipped (${stats.coveragePct}%) -> ${out}`);
