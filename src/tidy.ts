/**
 * "Tidy note": the whitespace and paste-residue cleanups, as one chosen set.
 *
 * Every step leaves fenced code, display maths, inline code and tables
 * alone, keeps Markdown hard line breaks (two trailing spaces) by default,
 * and never touches indentation, list markers or blockquote depth. The
 * frontmatter is the caller's business: `main.ts` trims a selection that
 * reaches into it, as it does for every other command.
 *
 * Nothing here imports `obsidian`, so it runs under plain Node.
 */

import { eachProseSegment, joinWrappedLines, removeInvisibles, replaceLigatures } from './cleanup.ts';
import { collapseBlankLines } from './lines.ts';
import { blockTracker } from './segments.ts';

export type TidyStep = 'invisibles' | 'ligatures' | 'join' | 'spaces' | 'trailing' | 'blank';

/** In the order they run: invisibles first so a non-breaking space is a space for the next step. */
export const TIDY_STEPS: readonly TidyStep[] = ['invisibles', 'ligatures', 'join', 'spaces', 'trailing', 'blank'];

export const TIDY_STEP_LABELS: Record<TidyStep, string> = {
  invisibles: 'Remove invisible characters',
  ligatures: 'Replace ligatures',
  join: 'Join wrapped lines',
  spaces: 'Collapse multiple spaces',
  trailing: 'Remove trailing whitespace',
  blank: 'Remove extra blank lines',
};

export interface TidyOptions {
  /** Which steps to run. */
  steps: readonly TidyStep[];
  /** Leave two trailing spaces before a line break alone. On by default. */
  keepHardBreaks?: boolean;
  /** Passed to the join step: drop the hyphen of a word split across lines. */
  removeHyphen?: boolean;
}

export interface TidyResult {
  text: string;
  /** Steps that changed something, with how many lines each touched. */
  report: { step: TidyStep; count: number }[];
}

export interface TrailingOptions {
  keepHardBreaks?: boolean;
}

/** A markdown table delimiter row: `| --- | :-: |`. */
const DELIMITER_ROW = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const HEADING = /^[ \t]*#{1,6}[ \t]/;

/** Lines that belong to a table, whose cell padding is alignment, not noise. */
function tableLines(lines: string[]): boolean[] {
  const mask = lines.map((line) => line.trimStart().startsWith('|'));

  lines.forEach((line, i) => {
    if (i === 0 || !line.includes('|') || !DELIMITER_ROW.test(line) || !lines[i - 1].includes('|')) return;
    mask[i - 1] = true;
    mask[i] = true;
    for (let j = i + 1; j < lines.length && lines[j].includes('|') && lines[j].trim() !== ''; j++) mask[j] = true;
  });

  return mask;
}

function codeLines(lines: string[]): boolean[] {
  const inBlock = blockTracker();
  return lines.map((line) => inBlock(line));
}

/**
 * Strips spaces and tabs at the end of lines. Two or more trailing spaces
 * after text are a Markdown hard break (`<br>`), so by default they are
 * kept, as exactly two spaces, when another line of text follows. They go
 * after a heading, before a blank line and at the end of the text, where
 * they break nothing.
 */
export function removeTrailingWhitespace(text: string, options: TrailingOptions = {}): string {
  const keep = options.keepHardBreaks !== false;
  const lines = text.split('\n');
  const code = codeLines(lines);

  return lines.map((line, i) => {
    if (code[i]) return line;

    const trimmed = line.replace(/[ \t]+$/, '');
    const next = lines[i + 1];
    const isBreak =
      keep &&
      / {2,}$/.test(line) &&
      trimmed.trim() !== '' &&
      !HEADING.test(line) &&
      next !== undefined &&
      next.trim() !== '';

    return isBreak ? `${trimmed}  ` : trimmed;
  }).join('\n');
}

/** Indentation, blockquote markers and a list marker: structure a line keeps as it is. */
const PREFIX = /^[ \t]*(?:>[ \t]*)*(?:(?:[-*+]|\d+[.)])[ \t]+(?:\[[^\]\n]\][ \t]+)?)?/;
const LIST_ITEM = /^[ \t]*(?:>[ \t]*)*(?:[-*+]|\d+[.)])[ \t]/;
/** Inline code, wikilinks and inline maths: spans whose spacing is content. */
const INLINE_PROTECTED = /(`+[^`]*`+|\[\[[^\]\n]*\]\]|\$[^$\n]+\$)/;

function indentWidth(line: string): number {
  return (/^[ \t]*/.exec(line)?.[0] ?? '').replace(/\t/g, '    ').length;
}

/**
 * Turns runs of spaces between words into one space.
 *
 * Leading indentation, blockquote and list markers, trailing spaces (a hard
 * break, handled by `removeTrailingWhitespace`), table rows, inline code,
 * wikilinks and indented code blocks are left as they are.
 */
export function collapseMultipleSpaces(text: string): string {
  const lines = text.split('\n');
  const code = codeLines(lines);
  const table = tableLines(lines);
  let inList = false;
  let afterIndentedCode = false;

  return lines.map((line, i) => {
    if (code[i]) {
      afterIndentedCode = false;
      return line;
    }

    const blank = line.trim() === '';
    const isItem = LIST_ITEM.test(line);
    const indented = !blank && !isItem && !inList && indentWidth(line) >= 4 && (i === 0 || lines[i - 1].trim() === '' || afterIndentedCode);

    if (isItem) inList = true;
    else if (!blank && indentWidth(line) === 0) inList = false;
    afterIndentedCode = indented;

    if (blank || table[i] || indented) return line;

    const prefix = PREFIX.exec(line)?.[0] ?? '';
    const rest = line.slice(prefix.length);
    const trailing = /[ \t]*$/.exec(rest)?.[0] ?? '';
    const middle = rest.slice(0, rest.length - trailing.length);

    const collapsed = middle
      .split(INLINE_PROTECTED)
      .map((part, k) => (k % 2 === 1 ? part : part.replace(/ {2,}/g, ' ')))
      .join('');

    return prefix + collapsed + trailing;
  }).join('\n');
}

/** Lines that differ, or, when lines were merged or dropped, how many went. */
export function countChangedLines(before: string, after: string): number {
  if (before === after) return 0;

  const a = before.split('\n');
  const b = after.split('\n');
  if (a.length !== b.length) return Math.abs(a.length - b.length);

  return a.reduce((count, line, i) => count + (line === b[i] ? 0 : 1), 0);
}

/** Runs the chosen steps, in a fixed order, and reports what each one changed. */
export function tidy(input: string, options: TidyOptions): TidyResult {
  let text = input.replace(/\r\n?/g, '\n');
  const report: TidyResult['report'] = [];
  const wanted = new Set(options.steps);

  const run = (step: TidyStep, fn: (value: string) => string): void => {
    if (!wanted.has(step)) return;
    const next = fn(text);
    const count = countChangedLines(text, next);
    if (count > 0) report.push({ step, count });
    text = next;
  };

  run('invisibles', (t) => eachProseSegment(t, removeInvisibles));
  run('ligatures', replaceLigatures);
  run('join', (t) => joinWrappedLines(t, { removeHyphen: options.removeHyphen }));
  run('spaces', collapseMultipleSpaces);
  run('trailing', (t) => removeTrailingWhitespace(t, { keepHardBreaks: options.keepHardBreaks }));
  run('blank', collapseBlankLines);

  // Line-ending normalisation alone is not reported, but is still applied.
  return { text, report };
}

/**
 * True when `before`, the text from the start of the note up to the caret,
 * leaves the caret inside a fenced code block, a display-maths block or an
 * open inline code span.
 */
export function endsInsideCode(before: string): boolean {
  const lines = before.split('\n');
  const inBlock = blockTracker();
  let inside = false;

  lines.forEach((line, i) => {
    inside = inBlock(line);
    if (i === lines.length - 1 && !inside) {
      const ticks = line.match(/`+/g) ?? [];
      // An odd number of backtick runs on the line so far: a span is open.
      inside = ticks.length % 2 === 1;
    }
  });

  return inside;
}

/** The word touching `ch` in `line` as `[start, end]`, or null. */
export function wordRangeAt(line: string, ch: number): [number, number] | null {
  const isWordChar = (c: string | undefined): boolean => c !== undefined && /[\p{L}\p{N}_]/u.test(c);
  const isJoiner = (c: string | undefined): boolean => c === "'" || c === '’';

  let start = ch;
  let end = ch;

  if (!isWordChar(line[ch]) && !isWordChar(line[ch - 1])) return null;

  while (start > 0 && (isWordChar(line[start - 1]) || (isJoiner(line[start - 1]) && isWordChar(line[start - 2]) && isWordChar(line[start])))) start--;
  while (end < line.length && (isWordChar(line[end]) || (isJoiner(line[end]) && isWordChar(line[end - 1]) && isWordChar(line[end + 1])))) end++;

  return start === end ? null : [start, end];
}
