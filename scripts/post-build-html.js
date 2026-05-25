/**
 * Post-build HTML injection script.
 *
 * Expo Router's +html.tsx customizations (critical CSS, preconnect hints,
 * SEO meta tags, loading spinner) are NOT applied during `expo export`.
 * This script injects them into the generated dist/index.html after build.
 *
 * Run after: npx expo export --platform web
 * Usage:    node scripts/post-build-html.js
 *
 * Brand: Katalogos (locked apps/katalogos-web/brand/brand.config.json — KW-02 + KT-02 + P-01).
 */

const fs = require('fs');
const path = require('path');

const DIST_HTML = path.join(__dirname, '..', 'dist', 'index.html');

const SEO_TITLE = 'Katalogos — Your menu, online in minutes';
const SEO_DESCRIPTION =
  'Build a beautiful digital menu for your restaurant. QR code per table, ' +
  'real-time updates, multi-language. Free trial, no credit card required.';
const SEO_URL = 'https://katalogos.dloizides.com';
const SEO_IMAGE = '/icons/logo-512.png';
const SEO_SITE_NAME = 'Katalogos';
const SEO_LOCALE = 'en_US';
const MARKETING_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;700&display=swap';

// Locked P-01 Terracotta Warm tokens — landing background + clay primary.
const criticalCss = [
  '*,*::before,*::after{box-sizing:border-box}',
  'body{margin:0;font-family:"Manrope",-apple-system,BlinkMacSystemFont,',
  '"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
  'background:#f4ede2;color:#1c1410;-webkit-font-smoothing:antialiased}',
  '.loading-container{display:flex;justify-content:center;',
  'align-items:center;height:100vh;width:100%;background:#f4ede2;',
  'position:fixed;top:0;left:0;z-index:9999}',
  '.loading-spinner{width:40px;height:40px;border:3px solid #d3c5b6;',
  'border-top-color:#b04632;border-radius:50%;',
  'animation:spin 1s linear infinite}',
  '@keyframes spin{to{transform:rotate(360deg)}}',
  '#root{min-height:100vh;display:flex;flex-direction:column}',
].join('');

const headInjection = [
  '<!-- Critical CSS for immediate render (LCP optimization) -->',
  `<style>${criticalCss}</style>`,
  '',
  '<!-- Resource hints for faster API connections -->',
  '<link rel="preconnect" href="https://identity.dloizides.com">',
  '<link rel="dns-prefetch" href="https://identity.dloizides.com">',
  '<link rel="preconnect" href="https://katalogos-api.dloizides.com">',
  '<link rel="dns-prefetch" href="https://katalogos-api.dloizides.com">',
  '',
  '<!-- Marketing wordmark + body font (Manrope) -->',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link rel="stylesheet" href="${MARKETING_FONT_HREF}">`,
  '',
  '<!-- SEO meta tags -->',
  `<meta name="robots" content="index, follow">`,
  `<link rel="canonical" href="${SEO_URL}">`,
  '',
  '<!-- Open Graph -->',
  `<meta property="og:title" content="${SEO_TITLE}">`,
  `<meta property="og:description" content="${SEO_DESCRIPTION}">`,
  '<meta property="og:type" content="website">',
  `<meta property="og:url" content="${SEO_URL}">`,
  `<meta property="og:image" content="${SEO_URL}${SEO_IMAGE}">`,
  `<meta property="og:site_name" content="${SEO_SITE_NAME}">`,
  `<meta property="og:locale" content="${SEO_LOCALE}">`,
  '',
  '<!-- Twitter Card -->',
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${SEO_TITLE}">`,
  `<meta name="twitter:description" content="${SEO_DESCRIPTION}">`,
  `<meta name="twitter:image" content="${SEO_URL}${SEO_IMAGE}">`,
  '',
  '<!-- PWA -->',
  '<link rel="manifest" href="/manifest.json">',
  '<link rel="apple-touch-icon" href="/icons/logo-192.jpg">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  `<meta name="application-name" content="${SEO_SITE_NAME}">`,
  `<meta name="apple-mobile-web-app-title" content="${SEO_SITE_NAME}">`,
].join('\n');

const swScript = [
  "if('serviceWorker' in navigator){",
  'window.addEventListener("load",function(){',
  'var r=function(){navigator.serviceWorker',
  '.register("/service-worker.js")};',
  "typeof requestIdleCallback!=='undefined'",
  '?requestIdleCallback(r):setTimeout(r,0)})}',
].join('');

const loaderRemovalScript = [
  "document.addEventListener('DOMContentLoaded',function(){",
  "var l=document.getElementById('initial-loader');",
  "if(l){requestAnimationFrame(function(){l.style.opacity='0';",
  "l.style.transition='opacity 0.2s';",
  "setTimeout(function(){l.style.display='none'},200)})}});",
].join('');

const bodyInjectionStart = [
  '<!-- Loading placeholder while JS loads (LCP optimization) -->',
  '<div class="loading-container" id="initial-loader">',
  '  <div class="loading-spinner"></div>',
  '</div>',
].join('\n');

const bodyInjectionEnd = [
  `<script defer>${swScript}</script>`,
  `<script>${loaderRemovalScript}</script>`,
].join('\n');

function injectHtml() {
  if (!fs.existsSync(DIST_HTML)) {
    console.error('dist/index.html not found. Run expo export first.');
    process.exit(1);
  }

  let html = fs.readFileSync(DIST_HTML, 'utf8');

  // Replace title with SEO title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${SEO_TITLE}</title>`
  );

  // Replace description meta if it exists, or add it
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${SEO_DESCRIPTION}">`
    );
  }

  // Replace theme-color (default from app.json was "#008d5c"; switch to clay primary).
  html = html.replace(
    /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/?>/,
    `<meta name="theme-color" content="#b04632">`
  );

  // Inject head content before </head>
  html = html.replace('</head>', `${headInjection}\n</head>`);

  // Inject loading spinner after <body> opening, before the root div
  html = html.replace(
    '<div id="root">',
    `${bodyInjectionStart}\n<div id="root">`
  );

  // Inject service worker and loader removal before </body>
  html = html.replace('</body>', `${bodyInjectionEnd}\n</body>`);

  fs.writeFileSync(DIST_HTML, html, 'utf8');

  console.log('Post-build HTML injection complete:');
  console.log('  + Katalogos brand SEO meta tags applied');
  console.log('  + P-01 Terracotta Warm critical CSS inlined');
  console.log('  + Preconnect hints added (incl. Google Fonts for Manrope)');
  console.log('  + Open Graph + Twitter Card meta tags added');
  console.log('  + Theme-color set to clay primary (#b04632)');
  console.log('  + Loading spinner placeholder added');
  console.log('  + Service worker registration (deferred)');
  console.log('  + Loader removal script added');
}

injectHtml();
