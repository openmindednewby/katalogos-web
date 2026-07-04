#!/usr/bin/env node
/**
 * Post-`expo export` cache-buster for the STABLE-named bootstrap bundles.
 *
 * WHY THIS EXISTS
 * ---------------
 * Expo's web export keeps a *stable filename* for the three bootstrap bundles
 * (`entry-*.js`, `__expo-metro-runtime-*.js`, `__common-*.js`) across builds,
 * even though the lazy route chunks they reference (`index-<hash>.js`,
 * `login-<hash>.js`, …) get fresh content-hashed filenames every build. The
 * entry bundle holds the chunk map.
 *
 * Historically these bootstrap bundles were served `immutable`. A browser that
 * loaded the app during that window cached the entry FOR A YEAR. Because the
 * filename is stable, a fresh `index.html` after a deploy still points at the
 * SAME entry URL — so the browser serves its immutable-cached OLD entry, whose
 * chunk map points at route chunks that no longer exist → 404 → blank/broken
 * app. `Ctrl+Shift+R` does NOT evict an immutable resource, so those users are
 * stuck with no self-service recovery. (nginx now serves the bootstrap bundles
 * `no-cache`, which fixes it going forward — but does nothing for browsers that
 * already cached the old entry as immutable.)
 *
 * THE FIX
 * -------
 * Append a `?v=<content-hash>` query to each bootstrap `<script src>` in the
 * exported HTML. `index.html` is served `no-cache`, so every returning user
 * re-fetches the shell; the new shell references `entry-<hash>.js?v=<newhash>`,
 * a URL their immutable-cached `entry-<hash>.js` (no query) can NOT match →
 * forced fresh fetch of the current entry → correct chunk map → working app.
 * Zero user action, no cache-clear, no incognito. The `?v=` value is the
 * bundle's own content hash, so it changes iff the bundle content changes
 * (nginx ignores the query for file resolution and serves the file as usual).
 *
 * Runs in the Docker build right after `expo export` (and after any other HTML
 * post-processing). Idempotent — skips a ref that already carries `?v=`.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST_DIR = resolve(process.argv[2] ?? 'dist');
const HASH_LENGTH = 8;

// The three stable-named Expo bootstrap bundles (mirrors the nginx no-cache
// regex). Only these are stable-named; the route chunks are already hashed.
const BOOTSTRAP_SRC = /src="(\/_expo\/static\/js\/web\/(?:entry-|__expo-metro-runtime-|__common-)[^"?]+\.js)"/g;

/** Recursively collect every *.html file under a directory. */
const collectHtml = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...collectHtml(full));
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
};

/** Content hash of the referenced bundle, or null if it isn't on disk. */
const hashBundle = (webPath) => {
  const onDisk = join(DIST_DIR, webPath.replace(/^\//, ''));
  try {
    return createHash('sha256').update(readFileSync(onDisk)).digest('hex').slice(0, HASH_LENGTH);
  } catch {
    return null;
  }
};

let rewrittenRefs = 0;
const htmlFiles = collectHtml(DIST_DIR);

for (const file of htmlFiles) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(BOOTSTRAP_SRC, (whole, srcPath) => {
    const hash = hashBundle(srcPath);
    if (hash === null) {
      return whole; // referenced bundle missing — leave the ref untouched.
    }
    rewrittenRefs += 1;
    return `src="${srcPath}?v=${hash}"`;
  });
  if (updated !== original) {
    writeFileSync(file, updated);
  }
}

// eslint-disable-next-line no-console
console.log(
  `[cache-buster] appended ?v=<hash> to ${rewrittenRefs} bootstrap ref(s) across ${htmlFiles.length} HTML file(s) in ${DIST_DIR}`,
);
