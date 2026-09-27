/**
 * Commands that work on whole lines: sorting, removing duplicates, and
 * removing or collapsing blank lines.
 *
 * Sorting is Markdown-aware. A list item moves together with the lines
 * indented under it (its sub-items and continuation lines), items are
 * compared by their text rather than by the bullet or checkbox in front,
 * and an ordered list is renumbered afterwards. The comparison is natural
 * (`item 2` before `item 10`) and ignores case and accents.
 *
 * Lines inside fenced code blocks are never removed.
 */

export type SortOrder = 'asc' | 'desc';

const FENCE = /^\s*(`{3,}|~{3,})/;
const LIST_MARKER = /^(\s*)([-*+]|(\d+)([.)]))(\s+)(\[.\]\s+)?/;

function indentOf(line: string): number {
  return (/^[ \t]*/.exec(line)?.[0] ?? '').replace(/\t/g, '    ').length;
}

/** For each line, whether it sits inside a fenced code block (fences included). */
function inCode(lines: string[]): boolean[] {
  const result: boolean[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const open = FENCE.exec(line);
    if (fence !== null) {
      result.push(true);
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = null;
    } else if (open) {
      fence = open[1];
      result.push(true);
    } else {
      result.push(false);
    }
  }
  return result;
}

/** What a line is compared by: its text without list marker or checkbox. */
function sortKey(line: string): string {
  return line.replace(LIST_MARKER, '').trim();
}

const collator = (locale?: string) => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });

/**
 * Groups lines into the units a sort moves: each line at the shallowest
 * indent starts a unit, and deeper lines after it belong to it. Blank lines
 * between units stay with the unit above them only when a deeper line
 * follows; otherwise they are their own unit, which sorts to the end.
 */
function units(lines: string[]): string[][] {
  const nonBlank = lines.filter((line) => line.trim() !== '');
  if (nonBlank.length === 0) return lines.map((line) => [line]);
  const base = Math.min(...nonBlank.map(indentOf));

  const result: string[][] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const current = result[result.length - 1];
    if (line.trim() === '') {
      const next = lines.slice(i + 1).find((l) => l.trim() !== '');
      if (current && next !== undefined && indentOf(next) > base) current.push(line);
      else result.push([line]);
    } else if (current && indentOf(line) > base && current[0].trim() !== '') {
      current.push(line);
    } else {
      result.push([line]);
    }
  }
  return result;
}

/** Renumbers the top-level items of an ordered list, starting from the first one's number. */
function renumber(sorted: string[][]): void {
  const heads = sorted.filter((unit) => unit[0].trim() !== '').map((unit) => LIST_MARKER.exec(unit[0]));
  if (heads.length === 0 || heads.some((m) => m === null || m[3] === undefined)) return;
  let n = Math.min(...heads.map((m) => Number(m![3])));
  for (const unit of sorted) {
    if (unit[0].trim() === '') continue;
    unit[0] = unit[0].replace(LIST_MARKER, (_all, indent: string, _m, _num, delim: string, space: string, box?: string) =>
      `${indent}${n}${delim}${space}${box ?? ''}`,
    );
    n++;
  }
}

/** Sorts the lines of `text`, keeping list items with their children. */
export function sortLines(text: string, order: SortOrder = 'asc', locale?: string): string {
  const lines = text.split('\n');
  // A trailing newline is not a line to sort.
  const trailing = lines.length > 1 && lines[lines.length - 1] === '' ? lines.pop() : undefined;
  const compare = collator(locale);

  const all = units(lines);
  const blanks = all.filter((unit) => unit[0].trim() === '');
  const items = all.filter((unit) => unit[0].trim() !== '');
  // Stable, and ties in the key fall back to the full line so the result
  // does not depend on the order the lines came in.
  items.sort((a, b) => {
    const byKey = compare.compare(sortKey(a[0]), sortKey(b[0])) || compare.compare(a[0], b[0]);
    return order === 'asc' ? byKey : -byKey;
  });
  renumber(items);

  const out = [...items, ...blanks].flat();
  if (trailing !== undefined) out.push(trailing);
  return out.join('\n');
}

/**
 * Removes every repeat of a line after its first appearance. Lines are
 * compared exactly, trailing spaces aside; blank lines and lines in code
 * blocks are left alone.
 */
export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n');
  const code = inCode(lines);
  const seen = new Set<string>();
  return lines
    .filter((line, i) => {
      if (code[i] || line.trim() === '') return true;
      const key = line.replace(/\s+$/, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n');
}

/** Removes blank lines outside code blocks. A trailing newline is kept. */
export function removeBlankLines(text: string): string {
  const lines = text.split('\n');
  const trailing = lines.length > 1 && lines[lines.length - 1] === '';
  const code = inCode(lines);
  const kept = lines.filter((line, i) => code[i] || line.trim() !== '');
  if (trailing && kept[kept.length - 1] !== '') kept.push('');
  return kept.join('\n');
}

/** Turns every run of blank lines outside code blocks into a single blank line. */
export function collapseBlankLines(text: string): string {
  const lines = text.split('\n');
  const code = inCode(lines);
  return lines
    .filter((line, i) => code[i] || line.trim() !== '' || i === 0 || lines[i - 1].trim() !== '' || code[i - 1])
    .join('\n');
}
