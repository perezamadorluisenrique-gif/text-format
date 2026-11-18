/**
 * When a cleanup is big enough that a one-line tip about cleaning many notes at once
 * is relevant: a selection or note of at least 40 lines or 3,000 characters.
 * Pure, so it is tested under plain Node.
 */

/** At least this many lines is a large cleanup. */
export const LARGE_LINES = 40;
/** At least this many characters is a large cleanup. */
export const LARGE_CHARS = 3000;

/** The size of what a cleanup covers: lines and characters, summed over all the selections. */
export interface CleanupSize {
  lines: number;
  chars: number;
}

export function isLargeCleanup(size: CleanupSize): boolean {
  return size.lines >= LARGE_LINES || size.chars >= LARGE_CHARS;
}

/** The size of text that is about to be cleaned (an empty string has no lines). */
export function sizeOf(texts: readonly string[]): CleanupSize {
  let lines = 0;
  let chars = 0;
  for (const text of texts) {
    if (text === '') continue;
    lines += text.split('\n').length;
    chars += text.length;
  }
  return { lines, chars };
}
