const fs = require('fs');
const path = require('path');

const CANONICAL_TAG = /<link rel="canonical" href="[^"]*">/;
const OG_URL_TAG = /<meta property="og:url" content="[^"]*">/;
const LOC_TAG = /<loc>([^<]+)<\/loc>/g;

function sitemapRoutes(sitemapXml, origin) {
  return [...sitemapXml.matchAll(LOC_TAG)]
    .map((match) => new URL(match[1].trim()))
    .filter((url) => url.origin === origin && url.pathname !== '/')
    .map((url) => url.pathname.replace(/\/+$/, ''));
}

function withCanonical(html, url) {
  if (!CANONICAL_TAG.test(html)) throw new Error('exported html has no canonical link');
  return html
    .replace(CANONICAL_TAG, `<link rel="canonical" href="${url}">`)
    .replace(OG_URL_TAG, `<meta property="og:url" content="${url}">`);
}

function writeRouteCanonicals(distDir, origin) {
  const shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const routes = sitemapRoutes(fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8'), origin);
  routes.forEach((route) => {
    const file = path.join(distDir, `${route.slice(1)}.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, withCanonical(shell, `${origin}${route}`), 'utf8');
  });
  return routes;
}

if (require.main === module) {
  const [distDir, origin] = process.argv.slice(2);
  console.log(`route canonicals: ${writeRouteCanonicals(distDir, origin).join(', ')}`);
}

module.exports = { sitemapRoutes, withCanonical, writeRouteCanonicals };
