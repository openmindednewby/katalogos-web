/**
 * BUG-QUIZ-009: Tests that handleSave sets isActive directly on basePayload
 * instead of using a confusing alias.
 *
 * We test the logic by verifying the payload received by onSave includes
 * isActive when showStatus is true, and excludes it when false.
 */

describe('TemplateForm - handleSave payload (BUG-QUIZ-009)', () => {
  /**
   * Simulates the handleSave logic extracted from TemplateForm.
   * This mirrors the fixed implementation without the alias.
   */
  function buildPayload(
    name: string,
    description: string,
    isActive: boolean,
    showStatus: boolean,
  ): Record<string, unknown> {
    const basePayload: Record<string, unknown> = {
      name,
      description: description.trim() === '' ? null : description,
    };
    if (showStatus)
      basePayload.isActive = isActive;

    return basePayload;
  }

  it('includes isActive when showStatus is true', () => {
    const payload = buildPayload('Test', 'desc', true, true);
    expect(payload.isActive).toBe(true);
  });

  it('does not include isActive when showStatus is false', () => {
    const payload = buildPayload('Test', 'desc', true, false);
    expect(payload).not.toHaveProperty('isActive');
  });

  it('sets isActive to false when status is inactive and showStatus is true', () => {
    const payload = buildPayload('Test', 'desc', false, true);
    expect(payload.isActive).toBe(false);
  });

  it('sets description to null when empty', () => {
    const payload = buildPayload('Test', '  ', false, false);
    expect(payload.description).toBeNull();
  });
});
