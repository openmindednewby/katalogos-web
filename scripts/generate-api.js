/* eslint-disable no-console */
const fs = require('fs');
const { execSync } = require('child_process');
const { URL } = require('url');
const http = require('http');
const https = require('https');

// Config
const OUT_PATH = './src/server/swagger.json';
const DEFAULT_URL = './src/server/swagger.json';
const target = process.env.OPENAPI_URL || DEFAULT_URL;

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;

      const opts = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
      };

      // Accept self-signed certs for local dev only
      if (parsed.protocol === 'https:') {
        opts.rejectUnauthorized = false;
      }

      const req = lib.request(parsed, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to download ${url} - status ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          fs.mkdirSync(require('path').dirname(dest), { recursive: true });
          fs.writeFileSync(dest, body, 'utf8');
          resolve(dest);
        });
      });

      req.on('error', (err) => reject(err));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

(async () => {
  console.log('generate-api: target =', target);

  try {
    if (target.startsWith('http')) {
      console.log('Downloading OpenAPI spec to', OUT_PATH);
      await download(target, OUT_PATH);
      console.log('Saved spec to', OUT_PATH);
    } else {
      console.log('Using local spec path:', target);
      if (!fs.existsSync(target)) {
        throw new Error(`Local spec not found: ${target}`);
      }
      fs.mkdirSync(require('path').dirname(OUT_PATH), { recursive: true });
      fs.copyFileSync(target, OUT_PATH);
      console.log('Copied local spec to', OUT_PATH);
    }
  } catch (err) {
    console.warn('Warning: could not download OpenAPI spec:', err.message || err);
    console.warn('Proceeding to run orval; ensure a valid spec exists at', OUT_PATH);
  }

  try {
  console.log('Running orval...');
  // prefer JS config for CLI compatibility
  execSync('npx orval --config orval.config.js', { stdio: 'inherit' });
    console.log('Orval generation finished.');
  // split orval output into per-hook wrapper files
  console.log('Splitting generated hooks into per-hook files...');
  execSync('node ./scripts/split-orval-output.js', { stdio: 'inherit' });
  console.log('Split complete.');
  } catch (err) {
    console.error('Orval generation failed:', err.message || err);
    process.exit(1);
  }
})();
