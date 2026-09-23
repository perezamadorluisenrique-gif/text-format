/**
 * Tokenising for every text command, and the spans they must not touch.
 *
 * Nothing here imports `obsidian`, so it runs under plain Node and is unit
 * tested directly. `main.ts` is the only file that talks to the editor.
 */

export type TokenKind = 'word' | 'atomic' | 'protected' | 'separator';

export interface Token {
  kind: TokenKind;
  text: string;
}

/**
 * Spans a command copies through untouched: inline code, inline math,
 * wikilinks, the target half of a markdown link, autolinks, bare URLs and
 * e-mail addresses.
 *
 * Lower-casing a URL can break it and re-casing code changes its meaning,
 * which is the root of issues #103, #104 and #115 upstream.
 */
/**
 * A file name or a domain: `main.ts`, `notes.md`, `obsidian.md`. Title case
 * made `Main.Ts` of the first, which is neither the file nor a word. Only
 * the extensions listed count, so a missing space after a full stop
 * (`end.Next`) is still read as two words.
 */
const FILE_EXTENSIONS = [
  'md', 'txt', 'pdf', 'canvas', 'base', 'csv', 'json', 'ya?ml', 'toml', 'xml', 'html?', 'css',
  'm?[jt]sx?', 'cjs', 'py', 'rb', 'rs', 'go', 'java', 'kt', 'swift', 'c', 'h', 'cpp', 'cs', 'php', 'sh', 'sql',
  'png', 'jpe?g', 'gif', 'svg', 'webp', 'mp[34]', 'wav', 'zip', 'docx?', 'xlsx?', 'pptx?', 'epub',
  'com', 'org', 'net', 'io', 'dev', 'app',
];
const FILE_NAME_SOURCE =
  `[\\p{L}\\p{N}_-]+(?:\\.[\\p{L}\\p{N}_-]+)*\\.(?:${FILE_EXTENSIONS.join('|')})(?![\\p{L}\\p{N}])`;

const PROTECTED_SOURCE = [
  '`[^`\\n]*`',
  '\\$[^$\\n]+\\$',
  '\\[\\[[^\\]\\n]*\\]\\]',
  '\\]\\([^)\\s]*\\)',
  '<[^<>\\s]+>',
  'https?://\\S+',
  'www\\.\\S+',
  '[\\w.+-]+@[\\w-]+\\.[\\w-]+(?:\\.[\\w-]+)*',
  FILE_NAME_SOURCE,
].join('|');

/**
 * Runs that look like the end of a sentence but are not: `e.g.`, `U.S.A.`,
 * `3.14`, `1,000.50`. They become single tokens, so the sentence commands
 * never start a new sentence in the middle of one, and so sentence case
 * leaves an abbreviation's own capitals alone.
 */
const ATOMIC_SOURCE = [
  '\\d+(?:[.,]\\d+)+',
  '(?:\\p{L}\\.){2,}',
].join('|');

/**
 * A word: letters and digits, with apostrophes allowed *inside* it.
 *
 * The apostrophe is the point. Splitting on it is what makes upstream's
 * "capitalize only first word" turn `don't` into `Don'T` (issue #33).
 */
const WORD_SOURCE = "[\\p{L}\\p{N}]+(?:['’][\\p{L}\\p{N}]+)*";

const TOKEN_SOURCE =
  `(${PROTECTED_SOURCE})|(${ATOMIC_SOURCE})|(${WORD_SOURCE})`;

/** Splits text into words, atoms, protected spans and everything between. */
export function tokenize(text: string): Token[] {
  const regex = new RegExp(TOKEN_SOURCE, 'gu');
  const tokens: Token[] = [];
  let last = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: 'separator', text: text.slice(last, match.index) });
    }

    const kind: TokenKind =
      match[1] !== undefined ? 'protected' :
      match[2] !== undefined ? 'atomic' : 'word';

    tokens.push({ kind, text: match[0] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    tokens.push({ kind: 'separator', text: text.slice(last) });
  }

  return tokens;
}

export function render(tokens: Token[]): string {
  return tokens.map((token) => token.text).join('');
}

/** `undefined` means "use the runtime default", which is what `toUpperCase` does. */
export type Locale = string | undefined;

export function upper(text: string, locale: Locale): string {
  return locale ? text.toLocaleUpperCase(locale) : text.toUpperCase();
}

export function lower(text: string, locale: Locale): string {
  return locale ? text.toLocaleLowerCase(locale) : text.toLowerCase();
}

/** First letter up, the rest down. Split by code point, not by UTF-16 unit. */
export function capitalise(word: string, locale: Locale): string {
  const chars = Array.from(word);
  if (chars.length === 0) return word;

  return upper(chars[0], locale) + lower(chars.slice(1).join(''), locale);
}

/**
 * True for `NASA` and `PDF`, false for `I`, `Hello` and `123`.
 *
 * A single letter is excluded on purpose: `A` and `I` are ordinary words
 * that happen to be capital, and treating them as acronyms would freeze
 * them mid-sentence.
 */
export function isAcronym(word: string, locale: Locale): boolean {
  if (Array.from(word).length < 2) return false;
  if (word === lower(word, locale)) return false;

  return word === upper(word, locale);
}

/** A fence that opens a code block: three or more backticks or tildes. */
const FENCE_OPEN = /^[ \t]*(`{3,}|~{3,})/;
/** A fence that can close one: nothing after the run but spaces. */
const FENCE_CLOSE = /^[ \t]*(`{3,}|~{3,})[ \t]*$/;

function countOf(haystack: string, needle: string): number {
  let count = 0;
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + needle.length)) {
    count++;
  }
  return count;
}

/**
 * Follows fenced code blocks and `$$` display maths down a text, one line
 * at a time. The returned function answers, for each line in order, whether
 * it belongs to such a block, delimiters included; those lines are code or
 * LaTeX, and recasing `\Sigma` to `\sigma` changes the formula.
 *
 * A fence closes only on a run of the same character at least as long as
 * the one that opened it, so a ```` block can quote a ``` block without the
 * inner fence switching the commands back on halfway through.
 */
export function blockTracker(): (line: string) => boolean {
  let fence: string | null = null;
  let inMath = false;

  return (line) => {
    if (fence !== null) {
      const close = FENCE_CLOSE.exec(line);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      return true;
    }
    if (inMath) {
      if (countOf(line, '$$') % 2 === 1) inMath = false;
      return true;
    }
    const open = FENCE_OPEN.exec(line);
    if (open) {
      fence = open[1];
      return true;
    }
    // An odd number of `$$` opens a block; `$$x$$` on one line is inline.
    if (countOf(line, '$$') % 2 === 1) {
      inMath = true;
      return true;
    }
    return false;
  };
}

/**
 * How many lines at the top of a note are its frontmatter, fences included,
 * or 0 when it has none. `line(i)` returns line `i`, or undefined past the
 * end, so the caller never has to copy the whole note.
 *
 * Property keys are case sensitive and their values are data, so no command
 * may rewrite them, not even when the whole note is selected.
 */
export function frontmatterLineCount(line: (index: number) => string | undefined): number {
  const first = line(0);
  if (first === undefined || first.replace(/\s+$/, '') !== '---') return 0;

  for (let i = 1; ; i++) {
    const text = line(i);
    if (text === undefined) return 0;
    const trimmed = text.replace(/\s+$/, '');
    if (trimmed === '---' || trimmed === '...') return i + 1;
  }
}
