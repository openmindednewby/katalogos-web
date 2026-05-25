import { generateSessionId } from './SessionEnricher';

describe('generateSessionId', () => {
  it('generates a string matching the timestamp-random format', () => {
    const sessionId = generateSessionId();

    expect(sessionId).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('starts with a numeric timestamp', () => {
    const before = Date.now();
    const sessionId = generateSessionId();
    const after = Date.now();

    const timestampPart = Number(sessionId.split('-')[0]);

    expect(timestampPart).toBeGreaterThanOrEqual(before);
    expect(timestampPart).toBeLessThanOrEqual(after);
  });

  it('generates unique IDs on successive calls', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();

    expect(id1).not.toBe(id2);
  });

  it('includes a random alphanumeric suffix', () => {
    const sessionId = generateSessionId();
    const randomPart = sessionId.split('-').slice(1).join('-');

    expect(randomPart.length).toBeGreaterThan(0);
    expect(randomPart).toMatch(/^[a-z0-9]+$/);
  });
});
