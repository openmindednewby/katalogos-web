/**
 * Undo/Redo hook for the Menu Editor.
 * Manages state snapshots via useReducer with a configurable history cap.
 */
import { useCallback, useReducer } from 'react';

import { UNDO_STACK_MAX_SIZE } from './undoRedoConstants';
import { UndoRedoActionType } from '../enums/UndoRedoActionType';

import type { MenuContents } from '../../../types/menuTypes';

/** A snapshot of the editor state at a point in time. */
export interface EditorSnapshot {
  name: string;
  description: string;
  menuContents: MenuContents;
}

/** Internal undo/redo state shape. */
export interface UndoRedoState {
  past: EditorSnapshot[];
  present: EditorSnapshot;
  future: EditorSnapshot[];
}

type UndoRedoAction =
  | { type: UndoRedoActionType.Push; snapshot: EditorSnapshot }
  | { type: UndoRedoActionType.Undo }
  | { type: UndoRedoActionType.Redo }
  | { type: UndoRedoActionType.Reset; snapshot: EditorSnapshot };

function pushSnapshot(state: UndoRedoState, snapshot: EditorSnapshot): UndoRedoState {
  const past = [...state.past, state.present];
  const trimmedPast = past.length > UNDO_STACK_MAX_SIZE
    ? past.slice(past.length - UNDO_STACK_MAX_SIZE)
    : past;
  return { past: trimmedPast, present: snapshot, future: [] };
}

function undoSnapshot(state: UndoRedoState): UndoRedoState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

function redoSnapshot(state: UndoRedoState): UndoRedoState {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  return {
    past: [...state.past, state.present],
    present: next,
    future: state.future.slice(1),
  };
}

/** Reducer for undo/redo state management. Exported for direct testing. */
export function undoRedoReducer(state: UndoRedoState, action: UndoRedoAction): UndoRedoState {
  switch (action.type) {
    case UndoRedoActionType.Push: return pushSnapshot(state, action.snapshot);
    case UndoRedoActionType.Undo: return undoSnapshot(state);
    case UndoRedoActionType.Redo: return redoSnapshot(state);
    case UndoRedoActionType.Reset: return { past: [], present: action.snapshot, future: [] };
    default: return state;
  }
}

interface UseUndoRedoReturn {
  present: EditorSnapshot;
  canUndo: boolean;
  canRedo: boolean;
  push: (snapshot: EditorSnapshot) => void;
  undo: () => void;
  redo: () => void;
  reset: (snapshot: EditorSnapshot) => void;
}

export function useUndoRedo(initial: EditorSnapshot): UseUndoRedoReturn {
  const [state, dispatch] = useReducer(undoRedoReducer, {
    past: [],
    present: initial,
    future: [],
  });

  const push = useCallback((snapshot: EditorSnapshot) => {
    dispatch({ type: UndoRedoActionType.Push, snapshot });
  }, []);

  const undo = useCallback(() => { dispatch({ type: UndoRedoActionType.Undo }); }, []);
  const redo = useCallback(() => { dispatch({ type: UndoRedoActionType.Redo }); }, []);

  const reset = useCallback((snapshot: EditorSnapshot) => {
    dispatch({ type: UndoRedoActionType.Reset, snapshot });
  }, []);

  return {
    present: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    push,
    undo,
    redo,
    reset,
  };
}
