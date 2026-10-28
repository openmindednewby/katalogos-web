const fs = require('fs');
const os = require('os');
const path = require('path');
const { sitemapRoutes, withCanonical, writeRouteCanonicals } = require('./route-canonicals');

const ORIGIN = 'https://app.example.com';
const SHELL =
  '<head><meta property="og:url" content="https://app.example.com">' +
  '<link rel="canonical" href="https://app.example.com"></head>';

describe('sitemapRoutes', () => {
  it('with root, sub-pages and a foreign host, returns only own non-root paths', () => {
    const xml =
      '<urlset><url><loc>https://app.example.com/</loc></url>' +
      '<url><loc> https://app.example.com/pricing/ </loc></url>' +
      '<url><loc>https://other.example.com/pricing</loc></url></urlset>';

    const routes = sitemapRoutes(xml, ORIGIN);

    expect(routes).toEqual(['/pricing']);
  });
});

describe('withCanonical', () => {
  it('with a root canonical, points canonical and og:url at the given page', () => {
    const html = withCanonical(SHELL, 'https://app.example.com/pricing');

    expect(html).toBe(
      '<head><meta property="og:url" content="https://app.example.com/pricing">' +
        '<link rel="canonical" href="https://app.example.com/pricing"></head>',
    );
  });

  it('with no canonical link, throws', () => {
    const shell = '<head></head>';

    const act = () => withCanonical(shell, 'https://app.example.com/pricing');

    expect(act).toThrow('exported html has no canonical link');
  });
});

describe('writeRouteCanonicals', () => {
  it('with a sitemap sub-page, writes <page>.html with a self canonical', () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'route-canonicals-'));
    fs.writeFileSync(path.join(dist, 'index.html'), SHELL);
    fs.writeFileSync(path.join(dist, 'sitemap.xml'), '<loc>https://app.example.com/pricing</loc>');

    writeRouteCanonicals(dist, ORIGIN);

    expect(fs.readFileSync(path.join(dist, 'pricing.html'), 'utf8')).toContain(
      '<link rel="canonical" href="https://app.example.com/pricing">',
    );
  });
});
