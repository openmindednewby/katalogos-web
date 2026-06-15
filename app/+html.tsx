import type { PropsWithChildren, ReactElement } from 'react';

import { ScrollViewStyleReset } from 'expo-router/html';

// SEO Configuration Constants — Katalogos marketing brand (locked).
// Mirrors apps/katalogos-web/brand/brand.config.json (KW-02 Manrope + KT-02 tagline + P-01 palette).
const SEO_CONFIG = {
  title: 'Katalogos — Your menu, online in minutes',
  description:
    'Build a beautiful digital menu for your restaurant. QR code per table, real-time updates, multi-language. Free trial, no credit card required.',
  url: 'https://katalogos.dloizides.com',
  image: '/icons/logo-512.png',
  locale: 'en_US',
  siteName: 'Katalogos',
};

// Critical CSS for immediate visual rendering (LCP optimization).
// Body uses the locked Manrope font + cream gray-100 background for the marketing identity.
// In-app surfaces still get themed by the existing tenant-theme system at runtime.
const criticalCss = `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:"Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f4ede2;color:#1c1410;-webkit-font-smoothing:antialiased}
.loading-container{display:flex;justify-content:center;align-items:center;height:100vh;width:100%;background:#f4ede2;position:fixed;top:0;left:0;z-index:9999}
.loading-spinner{width:40px;height:40px;border:3px solid #d3c5b6;border-top-color:#b04632;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#root{min-height:100vh;display:flex;flex-direction:column}
`;

// Service worker registration - deferred to avoid blocking main thread (TBT optimization)
const swRegistrationScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    var register = function() {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(function(reg) { console.log('SW registered', reg.scope); })
        .catch(function(err) { console.warn('SW failed', err); });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(register);
    } else {
      setTimeout(register, 0);
    }
  });
}
`;

// Manifest probe - deferred and simplified
const manifestDebugScript = `
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  var probe = function() {
    fetch('/manifest.json', { cache: 'no-store' })
      .then(function(res) { if (!res.ok) console.warn('Manifest not reachable'); })
      .catch(function(e) { console.warn('Manifest probe error', e); });
  };
  if (typeof requestIdleCallback !== 'undefined') requestIdleCallback(probe);
}
`;

// Script to remove initial loader after React hydrates
const removeLoaderScript = `
document.addEventListener('DOMContentLoaded', function() {
  var loader = document.getElementById('initial-loader');
  if (loader) {
    requestAnimationFrame(function() {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.2s';
      setTimeout(function() { loader.style.display = 'none'; }, 200);
    });
  }
});
`;

const RootHtml = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />

        {/* Critical CSS - inlined for immediate render (LCP optimization) */}
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />

        {/* Resource hints for faster API connections (LCP optimization) */}
        <link href="https://identity.dloizides.com" rel="preconnect" />
        <link href="https://identity.dloizides.com" rel="dns-prefetch" />
        <link href="https://katalogos-api.dloizides.com" rel="preconnect" />
        <link href="https://katalogos-api.dloizides.com" rel="dns-prefetch" />

        {/* Marketing wordmark + body font (Manrope) — preconnect for fast first paint */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* SEO: Page Title */}
        <title>{SEO_CONFIG.title}</title>

        {/* SEO: Meta Description */}
        <meta content={SEO_CONFIG.description} name="description" />

        {/* SEO: Robots directive */}
        <meta content="index, follow" name="robots" />

        {/* SEO: Canonical URL */}
        <link href={SEO_CONFIG.url} rel="canonical" />

        {/* Open Graph meta tags for social sharing */}
        <meta content={SEO_CONFIG.title} property="og:title" />
        <meta content={SEO_CONFIG.description} property="og:description" />
        <meta content="website" property="og:type" />
        <meta content={SEO_CONFIG.url} property="og:url" />
        <meta content={`${SEO_CONFIG.url}${SEO_CONFIG.image}`} property="og:image" />
        <meta content={SEO_CONFIG.siteName} property="og:site_name" />
        <meta content={SEO_CONFIG.locale} property="og:locale" />

        {/* Twitter Card meta tags */}
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={SEO_CONFIG.title} name="twitter:title" />
        <meta content={SEO_CONFIG.description} name="twitter:description" />
        <meta content={`${SEO_CONFIG.url}${SEO_CONFIG.image}`} name="twitter:image" />

        {/* Link the PWA manifest */}
        <link href="/manifest.json" rel="manifest" />

        {/* iOS add-to-home support */}
        <link href="/icons/logo-192.jpg" rel="apple-touch-icon" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content={SEO_CONFIG.siteName} name="application-name" />
        <meta content={SEO_CONFIG.siteName} name="apple-mobile-web-app-title" />

        {/* Theme color: locked P-01 Terracotta primary */}
        <meta content="#b04632" name="theme-color" />

        <ScrollViewStyleReset />

        {/* Service worker registration - deferred (TBT optimization) */}
        <script defer dangerouslySetInnerHTML={{ __html: swRegistrationScript }} />
        {/* Debug: probe manifest availability (dev only, deferred) */}
        <script defer dangerouslySetInnerHTML={{ __html: manifestDebugScript }} />
        {/* Umami privacy-first analytics (web-app-standards). data-domains keeps
            staging/localhost traffic out of the prod dataset. */}
        <script
          defer
          data-domains="katalogos.dloizides.com"
          data-website-id="493b52aa-6e97-4bb5-95ab-056e7e90b4aa"
          src="https://analytics.dloizides.com/script.js"
        />
      </head>
      <body>
        {/* Loading placeholder for LCP - shows immediately while JS loads */}
        <div className="loading-container" id="initial-loader">
          <div className="loading-spinner" />
        </div>
        {children}
        {/* Remove initial loader once React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: removeLoaderScript }} />
      </body>
    </html>
  );
};

export default RootHtml;
