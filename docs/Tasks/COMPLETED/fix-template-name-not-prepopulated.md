# Fix: Template name not pre-populated in TemplateEditorModal

## Problem Statement
E2E test `edit-template.spec.ts:100` fails across all browsers. When the template editor modal opens, the name input has `value=""` instead of the template's name.

## Root Cause Analysis

The issue is a **timing/state flow** problem caused by `TemplateForm` using **internal state initialized from props** combined with React's `key` remounting behavior:

1. `TemplateEditorModal` has a `useLayoutEffect` that syncs state from the `item` prop (sets `name`, `description`, etc.)
2. `TemplateEditorForm` receives `name` as a prop and passes it as `initialName` to `TemplateForm`
3. `TemplateForm` initializes its own internal `useState(initialName)` -- this only runs on mount
4. `TemplateEditorForm` uses `key={itemKey}` to force remount when item changes
5. **The problem**: On the very first render of the lazy-loaded modal, the `useLayoutEffect` in `TemplateEditorModal` hasn't run yet. The component renders with the initial state values (`name = ''`), and `TemplateForm` captures that empty string as its initial state.

The `useLayoutEffect` runs after the first render but before paint. However, when it sets `name` via `setName(item.name)`, this triggers a re-render of `TemplateEditorModal` which passes the new `name` to `TemplateEditorForm`, which passes it as `initialName` to `TemplateForm`. But `TemplateForm`'s `useState(initialName)` only uses the initial value on mount -- subsequent prop changes are ignored unless the key changes.

Since `itemKey` is `item?.externalId`, and `item` is already set when the modal mounts (both `editingItem` and `isModalVisible` are set in `handleEdit`), the key doesn't change. The issue is that `TemplateForm`'s `onChange` effect fires with the empty initial values, overwriting the parent's state.

**Wait -- re-examining**: The parent `QuizTemplatesPage` conditionally renders the modal only when `isModalVisible` is true. And `handleEdit` sets both `editingItem` and `isModalVisible` in the same callback. So `item` IS available on the first render.

But the `useLayoutEffect` guard: `if (currentId === prevItemIdRef.current && !visible) return;` -- on first mount, `prevItemIdRef.current` is `undefined` and `currentId` is the item's ID, so they differ. The effect SHOULD run and set the name.

**The real issue**: `TemplateForm` has its own `useState(initialName)` AND a `useEffect` that calls `onChange({ name, description, isActive })` whenever those values change. On mount, `TemplateForm` initializes with `initialName` (which is `''` from the default state) and immediately fires `onChange` with `name: ''`, which calls `setName('')` in the parent, overwriting the value that `useLayoutEffect` just set.

**Sequence**:
1. Modal mounts with `item` prop set
2. `useLayoutEffect` runs synchronously and sets `name = item.name`
3. React re-renders `TemplateEditorModal` with `name = item.name`
4. `TemplateEditorForm` renders `TemplateForm` with `initialName = item.name`
5. But wait -- `TemplateForm` may already be mounted from step 1 with `initialName = ''`

Actually, since the modal is conditionally rendered (`isModalVisible ? <Suspense>...`), the entire tree mounts fresh. Let me re-trace:

1. `handleEdit` sets `editingItem = item` and `isModalVisible = true` (same callback, same render batch)
2. Parent re-renders, now `isModalVisible` is true, so `TemplateEditorModal` mounts
3. On mount: `name` state = `''`, `item` prop = the template
4. `useLayoutEffect` fires (synchronously before paint): sets `name = item.name`
5. This triggers another render where `TemplateEditorForm` gets `name = item.name`
6. `TemplateEditorForm` renders `TemplateForm key={item.externalId} initialName={item.name}`
7. `TemplateForm` mounts with `useState(item.name)` -- name = item.name
8. `TemplateForm`'s `useEffect` fires `onChange({ name: item.name, ... })` -- this is fine

But step 3-4 shows that on the FIRST render (before `useLayoutEffect` fires), `TemplateEditorForm` renders with `name = ''`. `TemplateForm` mounts with empty string. Then `useLayoutEffect` fires, causing a second render, but `TemplateForm` already has `key={item.externalId}` which hasn't changed, so it doesn't remount -- it keeps its internal state of `''`.

**This is the root cause**: `TemplateForm` uses `key={itemKey}` where `itemKey = item?.externalId`. The key is the SAME on both the first render (where `item` is set) and the second render (after `useLayoutEffect`). So `TemplateForm` never remounts and keeps its empty initial state.

The `useEffect` in `TemplateForm` that calls `onChange` would fire with empty values, overwriting what `useLayoutEffect` set.

## Fix
Remove the dual-state architecture. `TemplateForm` should be a controlled component when used inside `TemplateEditorForm`, using the parent's `name`/`description` directly via the `value` prop. The internal state is only needed for the standalone create form.

**Simpler fix**: Initialize `TemplateEditorModal` state directly from the `item` prop instead of starting with empty strings and syncing via `useLayoutEffect`.

## Files Modified
- `BaseClient/src/components/QuestionerTemplates/TemplateEditorModal.tsx`

## Success Criteria
- Name field shows template name when modal opens
- `npm run lint:fix` passes
- `npm run test:coverage` passes
- `npx expo export --platform web` builds
