/** Utility functions for parsing and formatting version snapshots. */
import { isValueDefined } from '@/utils/is';

interface SnapshotSummary {
  menuName: string;
  menuDescription: string;
  categoryCount: number;
  itemCount: number;
}

const MAX_SNAPSHOT_LINES = 20;

function toRecord(obj: object): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) result[key] = value;
  return result;
}

function countItems(categories: unknown[]): number {
  return categories.reduce(
    (sum: number, cat: unknown) => {
      if (!isValueDefined(cat) || typeof cat !== 'object') return sum;
      const record = toRecord(cat);
      return sum + (Array.isArray(record.items) ? record.items.length : 0);
    },
    0,
  );
}

/** Parse a JSON snapshot string into a human-readable summary. */
export function parseSnapshotSummary(snapshot: string): SnapshotSummary | null {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!isValueDefined(parsed) || typeof parsed !== 'object') return null;
    const obj = toRecord(parsed);
    const rawCategories = obj.categories;
    const categories = Array.isArray(rawCategories) ? rawCategories : [];
    const rawName = obj.menuName;
    const rawDesc = obj.menuDescription;
    return {
      menuName: typeof rawName === 'string' ? rawName : '',
      menuDescription: typeof rawDesc === 'string' ? rawDesc : '',
      categoryCount: categories.length,
      itemCount: countItems(categories),
    };
  } catch {
    return null;
  }
}

/** Format a raw JSON snapshot string for display, truncating to MAX_SNAPSHOT_LINES. */
export function formatSnapshot(snapshot: string): string {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    const formatted = JSON.stringify(parsed, null, 2);
    const lines = formatted.split('\n');
    if (lines.length > MAX_SNAPSHOT_LINES)
      return `${lines.slice(0, MAX_SNAPSHOT_LINES).join('\n')}\n...`;
    return formatted;
  } catch {
    return snapshot;
  }
}

export type { SnapshotSummary };
