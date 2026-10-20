import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseline = JSON.parse(readFileSync('.pattern-warning-baseline.json', 'utf8'));
let out;
try {
  out = execFileSync('node', ['node_modules/eslint/bin/eslint.js', '.', '-f', 'json'], { encoding: 'utf8', maxBuffer: 1 << 28 });
} catch (e) {
  out = e.stdout;
}
const warnings = JSON.parse(out).reduce((n, f) => n + f.warningCount, 0);
console.log(`warnings ${warnings} / baseline ${baseline.total}`);
if (warnings > baseline.total) process.exit(1);
