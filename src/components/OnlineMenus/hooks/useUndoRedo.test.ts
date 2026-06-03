import { UNDO_STACK_MAX_SIZE } from './undoRedoConstants';
import { undoRedoReducer } from './useUndoRedo';
import { UndoRedoActionType } from '../enums/UndoRedoActionType';

import type { EditorSnapshot, UndoRedoState } from './useUndoRedo';

function snap(name: string): EditorSnapshot {
  return { name, description: '', menuContents: { categories: [] } };
}

function stateWith(present: EditorSnapshot, past: EditorSnapshot[] = [], future: EditorSnapshot[] = []): UndoRedoState {
  return { past, present, future };
}

describe('undoRedoReducer', () => {
  it('pushes a new snapshot onto the stack', () => {
    const state = stateWith(snap('a'));
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('b') });

    expect(result.present.name).toBe('b');
    expect(result.past).toHaveLength(1);
    expect(result.past[0].name).toBe('a');
    expect(result.future).toHaveLength(0);
  });

  it('clears future on push', () => {
    const state = stateWith(snap('b'), [snap('a')], [snap('c')]);
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('d') });

    expect(result.future).toHaveLength(0);
    expect(result.present.name).toBe('d');
  });

  it('undoes to the previous snapshot', () => {
    const state = stateWith(snap('b'), [snap('a')]);
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Undo });

    expect(result.present.name).toBe('a');
    expect(result.past).toHaveLength(0);
    expect(result.future).toHaveLength(1);
    expect(result.future[0].name).toBe('b');
  });

  it('returns same state when undo called with empty past', () => {
    const state = stateWith(snap('a'));
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Undo });

    expect(result).toBe(state);
  });

  it('redoes to the next snapshot', () => {
    const state = stateWith(snap('a'), [], [snap('b')]);
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Redo });

    expect(result.present.name).toBe('b');
    expect(result.past).toHaveLength(1);
    expect(result.past[0].name).toBe('a');
    expect(result.future).toHaveLength(0);
  });

  it('returns same state when redo called with empty future', () => {
    const state = stateWith(snap('a'));
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Redo });

    expect(result).toBe(state);
  });

  it('resets to a new snapshot clearing all history', () => {
    const state = stateWith(snap('c'), [snap('a'), snap('b')], [snap('d')]);
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Reset, snapshot: snap('fresh') });

    expect(result.present.name).toBe('fresh');
    expect(result.past).toHaveLength(0);
    expect(result.future).toHaveLength(0);
  });

  it('enforces the maximum stack size on push', () => {
    const pastSnapshots = Array.from({ length: UNDO_STACK_MAX_SIZE }, (_, i) => snap(`past-${i}`));
    const state = stateWith(snap('current'), pastSnapshots);
    const result = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('new') });

    expect(result.past).toHaveLength(UNDO_STACK_MAX_SIZE);
    expect(result.past[0].name).toBe('past-1');
    expect(result.past[UNDO_STACK_MAX_SIZE - 1].name).toBe('current');
  });

  it('handles multiple undo then redo correctly', () => {
    let state = stateWith(snap('a'));
    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('b') });
    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('c') });
    state = undoRedoReducer(state, { type: UndoRedoActionType.Undo });
    state = undoRedoReducer(state, { type: UndoRedoActionType.Undo });

    expect(state.present.name).toBe('a');
    expect(state.future).toHaveLength(2);

    state = undoRedoReducer(state, { type: UndoRedoActionType.Redo });
    expect(state.present.name).toBe('b');

    state = undoRedoReducer(state, { type: UndoRedoActionType.Redo });
    expect(state.present.name).toBe('c');
    expect(state.future).toHaveLength(0);
  });

  it('push after undo discards forward history', () => {
    let state = stateWith(snap('a'));
    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('b') });
    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('c') });
    state = undoRedoReducer(state, { type: UndoRedoActionType.Undo });

    expect(state.present.name).toBe('b');
    expect(state.future).toHaveLength(1);

    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snap('d') });
    expect(state.present.name).toBe('d');
    expect(state.future).toHaveLength(0);
    expect(state.past).toHaveLength(2);
  });

  it('preserves menuContents across undo/redo', () => {
    const contentsA = { categories: [{ name: 'Cat A', items: [] }] };
    const contentsB = { categories: [{ name: 'Cat B', items: [] }] };
    const snapA: EditorSnapshot = { name: 'a', description: 'desc-a', menuContents: contentsA };
    const snapB: EditorSnapshot = { name: 'b', description: 'desc-b', menuContents: contentsB };

    let state = stateWith(snapA);
    state = undoRedoReducer(state, { type: UndoRedoActionType.Push, snapshot: snapB });

    expect(state.present.menuContents.categories?.[0].name).toBe('Cat B');

    state = undoRedoReducer(state, { type: UndoRedoActionType.Undo });
    expect(state.present.menuContents.categories?.[0].name).toBe('Cat A');
    expect(state.present.description).toBe('desc-a');
  });
});
