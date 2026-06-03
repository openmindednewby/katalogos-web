/**
 * SVG path definitions for all application icons.
 * Each icon is defined as one or more SVG path strings rendered inside
 * a 24x24 viewBox.
 */
const enum FillRule {
  EvenOdd = 'evenodd',
}

interface IconPath {
  d: string;
  fillRule?: FillRule;
}

interface IconDefinition {
  paths: IconPath[];
}

// Navigation
const menu: IconDefinition = { paths: [{ d: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z' }] };
const home: IconDefinition = { paths: [{ d: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z' }] };
const logout: IconDefinition = { paths: [{ d: 'M16 13v-2H7V8l-5 4 5 4v-3h9z' }, { d: 'M20 3H11v2h8v14h-8v2h9a1 1 0 001-1V4a1 1 0 00-1-1z' }] };

// Actions
const close: IconDefinition = { paths: [{ d: 'M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 10-1.41 1.42L10.59 12l-4.89 4.88a1 1 0 101.41 1.42L12 13.41l4.89 4.89a1 1 0 001.41-1.42L13.41 12l4.89-4.88a1 1 0 000-1.41z' }] };
const edit: IconDefinition = { paths: [{ d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' }] };
const trash: IconDefinition = { paths: [{ d: 'M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z' }] };
const eye: IconDefinition = { paths: [{ d: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z' }] };
const link: IconDefinition = { paths: [{ d: 'M3.9 12a3.1 3.1 0 013.1-3.1h4V7H7a5 5 0 000 10h4v-1.9H7A3.1 3.1 0 013.9 12zm4.6 1h7v-2h-7v2zM17 7h-4v1.9h4a3.1 3.1 0 010 6.2h-4V17h4a5 5 0 000-10z' }] };
const refresh: IconDefinition = { paths: [{ d: 'M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L14 10h6V4l-2.35 2.35z' }] };
const lightning: IconDefinition = { paths: [{ d: 'M13 2L3 14h7v8l10-12h-7V2z' }] };

// Notifications & Media
const bell: IconDefinition = { paths: [{ d: 'M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V10c0-3.07-1.63-5.64-4.5-6.32V3a1.5 1.5 0 00-3 0v.68C7.64 4.36 6 6.92 6 10v6l-2 2v1h16v-1l-2-2z' }] };
const play: IconDefinition = { paths: [{ d: 'M8 5v14l11-7L8 5z' }] };

// Chevrons & Arrows
const chevronDown: IconDefinition = { paths: [{ d: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z' }] };
const chevronUp: IconDefinition = { paths: [{ d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z' }] };
const chevronLeft: IconDefinition = { paths: [{ d: 'M15.41 7.41L10.83 12l4.58 4.59L14 18l-6-6 6-6 1.41 1.41z' }] };
const chevronRight: IconDefinition = { paths: [{ d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' }] };
const arrowUp: IconDefinition = { paths: [{ d: 'M12 4l-7 7h4v9h6v-9h4l-7-7z' }] };
const arrowDown: IconDefinition = { paths: [{ d: 'M12 20l7-7h-4V4H9v9H5l7 7z' }] };

// Layout Templates
const grid: IconDefinition = { paths: [{ d: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z' }] };
const list: IconDefinition = { paths: [{ d: 'M3 4h18v2H3V4zm0 5h18v2H3V9zm0 5h18v2H3v-2zm0 5h18v2H3v-2z' }] };
const cards: IconDefinition = { paths: [{ d: 'M3 3h18v18H3V3zm2 2v14h14V5H5z' }] };
const compact: IconDefinition = { paths: [{ d: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z' }] };
const diamond: IconDefinition = { paths: [{ d: 'M12 2L2 12l10 10 10-10L12 2zm0 3.41L18.59 12 12 18.59 5.41 12 12 5.41z' }] };
const squareFill: IconDefinition = { paths: [{ d: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z' }] };

// Module Icons
const document: IconDefinition = { paths: [{ d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z' }] };
const checkmark: IconDefinition = { paths: [{ d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' }] };
const memo: IconDefinition = { paths: [{ d: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z' }] };
const forkKnife: IconDefinition = { paths: [{ d: 'M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z' }] };
const building: IconDefinition = { paths: [{ d: 'M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z' }] };
const people: IconDefinition = { paths: [{ d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' }] };
const circle: IconDefinition = { paths: [{ d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z' }] };

// Chart and status icons
const barChart: IconDefinition = { paths: [{ d: 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z' }] };
const trendingUp: IconDefinition = { paths: [{ d: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z' }] };
const target: IconDefinition = { paths: [{ d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' }] };
const crosshair: IconDefinition = { paths: [{ d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L11 15v1c0 1.1.9 2 2 2v1.93zM17.9 17.39A7.96 7.96 0 0020 12c0-4.42-3.58-8-8-8-.74 0-1.45.1-2.14.28L12.72 7H15c1.1 0 2 .9 2 2v2l-3.07 3.07c-.09.01-.18-.07-.18-.07L13 13v-2h-2.5l-.16-.16L13 8.16V5.04c3.47.47 6.17 3.36 6.37 6.93l-1.97 2.03.5 3.39z' }] };
const fileText: IconDefinition = { paths: [{ d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z' }] };
const monitor: IconDefinition = { paths: [{ d: 'M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z' }] };
const server: IconDefinition = { paths: [{ d: 'M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zm0 4H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm0 6H4v-4h16v4zM6 7h2V5H6v2zm0 10h2v-2H6v2z' }] };
const triangle: IconDefinition = { paths: [{ d: 'M12 2L2 22h20L12 2zm0 4.21L18.53 20H5.47L12 6.21z' }] };
const sliders: IconDefinition = { paths: [{ d: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z' }] };
const shield: IconDefinition = { paths: [{ d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' }] };
const keyIcon: IconDefinition = { paths: [{ d: 'M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' }] };
const settings: IconDefinition = { paths: [{ d: 'M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58a7.07 7.07 0 000 1.88l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.61 3.61 0 0112 15.6z' }] };
const qrCode: IconDefinition = { paths: [{ d: 'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-4h2v2h-2v-2zm0 4h2v2h-2v-2z' }] };
const code: IconDefinition = { paths: [{ d: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z' }] };
const download: IconDefinition = { paths: [{ d: 'M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z' }] };
const copy: IconDefinition = { paths: [{ d: 'M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z' }] };

// Theme mode icons
const sun: IconDefinition = { paths: [{ d: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-1-4h2v3h-2V3zm0 15h2v3h-2v-3zM5.99 4.58l1.42 1.42-1.42 1.41L4.58 5.99 5.99 4.58zm12.02 12.02l1.42 1.42-1.42 1.41-1.41-1.42 1.41-1.41zM3 11h3v2H3v-2zm15 0h3v2h-3v-2zM4.58 18.01l1.42-1.42 1.41 1.42-1.42 1.41-1.41-1.41zm12.02-12.02l1.42-1.42 1.41 1.42-1.42 1.41-1.41-1.41z' }] };
const moon: IconDefinition = { paths: [{ d: 'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z' }] };

// Icon Registry
export const ICON_PATHS = {
  menu, home, logout, close, edit, trash, eye, link, refresh, lightning,
  bell, play,
  chevronDown, chevronUp, chevronLeft, chevronRight, arrowUp, arrowDown,
  grid, list, cards, compact, diamond, squareFill,
  document, checkmark, memo, forkKnife, building, people, circle,
  barChart, trendingUp, target, crosshair, fileText, monitor,
  server, triangle, sliders, shield, key: keyIcon, settings,
  qrCode, download, copy, code,
  sun, moon,
} as const;

export type IconName = keyof typeof ICON_PATHS;
