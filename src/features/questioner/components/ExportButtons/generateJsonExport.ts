import { Platform } from 'react-native';

import { type CompletedQuestionerWithUser } from '@/server/customHooks/useCompletedQuestionersWithUsers';
import { isValueDefined } from '@/utils/is';
import { logger } from '@/utils/logger';

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object';
}

function removeContentsJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeContentsJson);
  if (!isRecord(value)) return value;

  const output: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === 'contentsJson') continue;
    output[k] = removeContentsJson(v);
  }
  return output;
}

export function generateJsonExport(payload: CompletedQuestionerWithUser[]): void {
  const sanitized = payload.map((p) => removeContentsJson(p));
  const text = JSON.stringify(sanitized, null, 2);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answers_with_users.json';
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  logger.info('generateJsonExport', 'Export JSON (non-web fallback)', { length: text.length });
}
