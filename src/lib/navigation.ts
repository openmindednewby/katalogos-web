/**
 * Re-export shim — the implementation now lives in `@dloizides/utils`.
 *
 * Promoted in de-fork wave W1.1: this file was byte-identical in erevna-web and
 * katalogos-web. The shim keeps the ~4 existing call sites (`AuthProvider`, the
 * root and protected `_layout`s) importing from `@/lib/navigation` unchanged.
 *
 * NOTE for auditors: because this is a shim, a grep for `@dloizides/utils` will
 * NOT show these call sites as adopters. Count this file, not its importers.
 *
 * Prefer importing from `@dloizides/utils` directly in NEW code.
 */
export { setRedirectHandler, redirectTo } from '@dloizides/utils';
