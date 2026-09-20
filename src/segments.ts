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
const PROTECTED_SOURCE = [
  '`[^`\\n]*`',
  '\\$[^$\\n]+\\$',
  '\\[\\[[^\\]\\n]*\\]\\]',
  '\\]\\([^)\\s]*\\)',
  '<[^<>\\s]+>',
  'https?://\\S+',
  'www\\.\\S+',
  '[\\w.+-]+@[\\w-]+\\.[\\w-]+(?:\\.[\\w-]+)*',
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
