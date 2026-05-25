/**
 * Codemod: Reorder top-level statements to match enforce-function-style rule.
 *
 * Expected order: exports (zone 1) → private functions (zone 2) → constants (zone 3).
 * Imports, types, re-exports, and expression statements are exempt (zone 0)
 * and stay in their original position relative to the nearest zone boundary.
 *
 * Usage: node scripts/fix-function-ordering.mjs [file1.ts file2.ts ...]
 *        or: node scripts/fix-function-ordering.mjs --from-lint
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import ts from 'typescript';

// ---------------------------------------------------------------------------
// Classification (mirrors the ESLint rule logic)
// ---------------------------------------------------------------------------

function hasFunctionInit(stmt) {
  if (stmt.kind !== ts.SyntaxKind.VariableStatement) return false;
  const decl = stmt.declarationList.declarations[0];
  if (!decl?.initializer) return false;
  const k = decl.initializer.kind;
  return k === ts.SyntaxKind.ArrowFunction || k === ts.SyntaxKind.FunctionExpression;
}

function isExemptStatement(stmt) {
  if (stmt.kind === ts.SyntaxKind.ImportDeclaration) return true;
  if (stmt.kind === ts.SyntaxKind.TypeAliasDeclaration) return true;
  if (stmt.kind === ts.SyntaxKind.InterfaceDeclaration) return true;
  if (stmt.kind === ts.SyntaxKind.EnumDeclaration) return true;

  // ExportDeclaration covers both `export { x } from './y'` (re-export) and `export { x }` (local barrel).
  // Only re-exports (with moduleSpecifier) and type-only exports are exempt.
  if (stmt.kind === ts.SyntaxKind.ExportDeclaration) {
    if (stmt.isTypeOnly) return true; // export type { ... }
    if (stmt.moduleSpecifier) return true; // export { ... } from '...' or export * from '...'
    return false; // export { X } (local) → zone 1
  }

  // Expression statements (side effects like jest.mock) are exempt
  if (stmt.kind === ts.SyntaxKind.ExpressionStatement) return true;

  return false;
}

/**
 * Classify: 1 = constant, 2 = function/export, 0 = exempt.
 * Matches the corrected enforce-function-style ESLint rule.
 */
function classifyZone(stmt) {
  if (isExemptStatement(stmt)) return 0;

  // Export declarations (named or default) → zone 2
  const hasExportModifier =
    stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
  if (hasExportModifier) return 2;
  if (stmt.kind === ts.SyntaxKind.ExportAssignment) return 2;
  if (stmt.kind === ts.SyntaxKind.ExportDeclaration && !stmt.moduleSpecifier) return 2;

  // Private function declarations → zone 2
  if (stmt.kind === ts.SyntaxKind.FunctionDeclaration) return 2;

  // Private variable declarations
  if (stmt.kind === ts.SyntaxKind.VariableStatement) {
    if (hasFunctionInit(stmt)) return 2; // function-valued → zone 2
    return 1; // plain constant → zone 1
  }

  // Everything else → exempt
  return 0;
}

// ---------------------------------------------------------------------------
// Comment extraction
// ---------------------------------------------------------------------------

function getLeadingCommentText(sourceText, stmt) {
  const fullStart = stmt.getFullStart();
  const start = stmt.getStart();
  if (fullStart === start) return '';
  const leading = sourceText.slice(fullStart, start);
  // Only include actual comments and blank lines, not random whitespace
  return leading;
}

// ---------------------------------------------------------------------------
// Core: Reorder a single file
// ---------------------------------------------------------------------------

function reorderFile(filePath) {
  const sourceText = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const stmts = sourceFile.statements;
  if (stmts.length === 0) return false;

  // Classify each statement
  const entries = [];
  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i];
    const zone = classifyZone(stmt);
    const leading = getLeadingCommentText(sourceText, stmt);
    const stmtText = sourceText.slice(stmt.getStart(), stmt.getEnd());
    entries.push({ index: i, zone, leading, text: stmtText, fullText: leading + stmtText });
  }

  // Check if already ordered
  let maxZone = 0;
  let needsReorder = false;
  for (const e of entries) {
    if (e.zone === 0) continue;
    if (e.zone < maxZone) {
      needsReorder = true;
      break;
    }
    if (e.zone > maxZone) maxZone = e.zone;
  }

  if (!needsReorder) return false;

  // Slot-based reordering: exempt entries stay in place,
  // non-exempt entries are sorted by zone and placed back into their original slots.
  const nonExempts = entries.filter(e => e.zone !== 0);
  nonExempts.sort((a, b) => a.zone - b.zone);

  // Rebuild the entries array: exempt entries keep their position,
  // non-exempt slots are filled with the sorted entries.
  const reordered = [];
  let slotIdx = 0;
  for (const e of entries) {
    if (e.zone === 0) {
      reordered.push(e);
    } else {
      reordered.push(nonExempts[slotIdx++]);
    }
  }

  // Reassemble
  const parts = [];

  // Preserve any file-level leading content (before first statement)
  const firstStmtFullStart = stmts[0].getFullStart();
  if (firstStmtFullStart > 0) {
    parts.push(sourceText.slice(0, firstStmtFullStart));
  }

  for (const e of reordered) {
    parts.push(e.fullText);
  }

  // Preserve trailing content after last statement
  let result = parts.join('');
  const trailingContent = sourceText.slice(stmts[stmts.length - 1].getEnd());
  result += trailingContent;

  // Only write if changed
  if (result === sourceText) return false;

  writeFileSync(filePath, result, 'utf-8');
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  let files;

  if (process.argv.includes('--from-lint')) {
    // Get affected files from ESLint output
    try {
      const output = execSync(
        'npx eslint --format json "src/**/*.{ts,tsx}" "app/**/*.{ts,tsx}" "packages/**/*.{ts,tsx}" 2>/dev/null',
        { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
      );
      const results = JSON.parse(output);
      files = results
        .filter(r => r.messages.some(m => m.ruleId === 'enforce-function-style/enforce-function-style'))
        .map(r => r.filePath);
    } catch (e) {
      // ESLint exits non-zero when there are issues; parse stdout anyway
      if (e.stdout) {
        const results = JSON.parse(e.stdout);
        files = results
          .filter(r => r.messages.some(m => m.ruleId === 'enforce-function-style/enforce-function-style'))
          .map(r => r.filePath);
      } else {
        console.error('Failed to get file list from ESLint');
        process.exit(1);
      }
    }
  } else if (process.argv.includes('--from-json')) {
    const jsonIdx = process.argv.indexOf('--from-json');
    const jsonPath = process.argv[jsonIdx + 1];
    files = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  } else {
    files = process.argv.slice(2);
  }

  if (files.length === 0) {
    console.log('No files to process');
    return;
  }

  console.log(`Processing ${files.length} files...`);

  let fixed = 0;
  let failed = 0;
  const failures = [];

  for (const file of files) {
    try {
      if (reorderFile(file)) {
        fixed++;
      }
    } catch (e) {
      failed++;
      failures.push({ file, error: e.message });
    }
  }

  console.log(`Done: ${fixed} files reordered, ${files.length - fixed - failed} already ordered, ${failed} failures`);
  if (failures.length > 0) {
    console.log('Failures:');
    for (const f of failures) {
      console.log(`  ${f.file}: ${f.error}`);
    }
  }
}

main();
