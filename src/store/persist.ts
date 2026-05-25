import { LocalStorage } from './LocalStorage';

const isWeb = typeof window !== 'undefined';

// In-memory session store for native (non-web) environments where sessionStorage isn't available
const inMemorySession: Record<string, string> = {};

interface PersistConfig {
  local?: string[]; // slice names to persist to LocalStorage/SecureStore
  session?: string[]; // slice names to persist to sessionStorage (web) or in-memory (native)
}

type ParseResult = { ok: true; value: unknown } | { ok: false };

function tryParseJson(raw: string | null | undefined): ParseResult {
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false };
  try {
    const value: unknown = JSON.parse(raw);
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

function getSessionRaw(key: string): string | undefined {
  if (isWeb) {
    const raw = sessionStorage.getItem(key);
    return typeof raw === 'string' ? raw : undefined;
  }
  return inMemorySession[key];
}

export async function loadPersistedState(cfg: PersistConfig): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  if (cfg.local) 
    for (const key of cfg.local) 
      try {
        const raw = await LocalStorage.getItem(`persist:${key}`);
        const parsed = tryParseJson(raw);
        if (parsed.ok) result[key] = parsed.value;
      } catch {
        // ignore parse/read errors
      }
    
  

  if (cfg.session) 
    for (const key of cfg.session) 
      try {
        const raw = getSessionRaw(`persist:${key}`);
        const parsed = tryParseJson(raw);
        if (parsed.ok) result[key] = parsed.value;
      } catch {
        // ignore
      }
    
  

  return result;
}

export async function saveSliceToLocal(key: string, value: unknown): Promise<void> {
  try {
    await LocalStorage.setItem(`persist:${key}`, JSON.stringify(value ?? null));
  } catch {
    // ignore
  }
}

export function saveSliceToSession(key: string, value: unknown): void {
  try {
    if (isWeb) 
      sessionStorage.setItem(`persist:${key}`, JSON.stringify(value ?? null));
     else 
      inMemorySession[`persist:${key}`] = JSON.stringify(value ?? null);
    
  } catch {
    // ignore
  }
}
