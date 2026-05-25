/**
 * Tests for MenuStatus enum helpers.
 * Note: The functions are not exported, so we test the module exports.
 * If the functions need to be tested, they should be exported.
 */

// The MenuStatus module defines internal helpers that are not exported.
// This test file validates the module loads without errors.
describe('MenuStatus module', () => {
  it('loads without errors', () => {
    // Just importing the module ensures the const enum compiles correctly
    expect(() => require('./MenuStatus')).not.toThrow();
  });
});
