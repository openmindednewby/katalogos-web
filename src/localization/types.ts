/**
 * Shared localization types.
 * Matches the FM() function signature from localization/helpers.
 */

/** Translation function type matching the FM() signature */
export type TranslateFn = (id: string, p1?: string, p2?: string, p3?: string) => string;
