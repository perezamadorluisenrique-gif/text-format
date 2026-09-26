/**
 * The identifier cases: camelCase, PascalCase, snake_case, CONSTANT_CASE,
 * kebab-case, dot.case and slugs.
 *
 * Unlike the prose cases these rebuild the text: words are found, then
 * glued back together with the style's separator. Each line is converted
 * on its own and keeps its markdown prefix, so a bulleted list of titles
 * becomes a bulleted list of slugs instead of one long identifier. Inline
 * code, maths, links and URLs are left where they are and only the text
 * around them is converted.
 */

import { type Locale, blockTracker, lower, upper } from './segments.ts';

export type IdentifierStyle = 'camel' | 'pascal' | 'snake' | 'constant' | 'kebab' | 'dot' | 'slug';

export interface IdentifierOptions {
  /** A BCP 47 tag when the language needs its own case rules, e.g. `tr`. */
  locale?: Locale;
}

/** The same line prefix the prose cases keep: quotes, bullets, tasks, headings. */
const LINE_PREFIX =
  /^([ \t]*(?:>[ \t]*)*(?:(?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX/-][ \t]*\][ \t]+)?|#{1,6}[ \t]+)?)([\s\S]*)$/;

/**
 * Spans that are not words to rebuild: inline code, inline maths, wikilinks,
 * whole markdown links and images, autolinks, URLs and e-mail addresses.
 *
 * Unlike the prose cases, a file name is not protected: `Meeting notes.md`
 * has to become `meeting-notes-md` or stay whole, and splitting it at the
 * space helps nobody.
 */
const PROTECTED =
  /`[^`\n]*`|\$[^$\n]+\$|!?\[\[[^\]\n]*\]\]|!?\[[^\]\n]*\]\([^)\s]*\)|<[^<>\s]+>|https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w-]+(?:\.[\w-]+)*/gu;

/** A run of letters and digits, apostrophes inside it included. */
const CHUNK = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

/**
 * Where a run like `XMLHttpRequest2Go` breaks into words: before an upper
 * case letter that follows a lower case one or a digit (`xml|Http`,
 * `2|Go`), and before the last capital of an acronym that runs into a word
 * (`XML|Http`). Digits otherwise stay with the letters before them, so
 * `version2` and `h1` are one word each.
 *
 * Written as two replacements rather than one split on lookbehinds, which
 * older iOS versions cannot parse: a regex they reject would stop the whole
 * plugin from loading there.
 */
function breakCamel(chunk: string): string[] {
  return chunk
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1\u0000$2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1\u0000$2')
    .split('\u0000');
}

/**
 * The words in a piece of text, in order, with apostrophes dropped:
 * `don't stop` gives `dont` and `stop`, never `don` and `t`.
 */
export function splitWords(text: string): string[] {
  const words: string[] = [];
  for (const chunk of text.match(CHUNK) ?? []) {
    for (const word of breakCamel(chunk.replace(/['’]/g, ''))) {
      if (word.length > 0) words.push(word);
    }
  }
  return words;
}

/**
 * Letters that Unicode does not decompose into a base and an accent, so
 * that stripping the marks alone would leave them as they are.
 */
const TRANSLITERATIONS: Record<string, string> = {
  'ß': 'ss', 'ẞ': 'ss', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe', 'ø': 'o', 'Ø': 'o',
  'đ': 'd', 'Đ': 'd', 'ð': 'd', 'Ð': 'd', 'ł': 'l', 'Ł': 'l', 'þ': 'th', 'Þ': 'th', 'ı': 'i',
};

/**
 * `Café Über Straße` to `Cafe Uber Strasse`. Letters with no Latin base,
 * Cyrillic or Chinese for instance, are kept: dropping them would leave a
 * Russian title with an empty slug.
 */
export function stripAccents(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/[ßẞæÆœŒøØđĐðÐłŁþÞı]/g, (letter) => TRANSLITERATIONS[letter]);
}

function capitalise(word: string, locale: Locale): string {
  const chars = Array.from(word);
  return upper(chars[0], locale) + lower(chars.slice(1).join(''), locale);
}

/** Joins words in one style. Returns '' when there are none. */
export function joinWords(words: string[], style: IdentifierStyle, locale: Locale): string {
  switch (style) {
    case 'camel':
      return words.map((word, i) => (i === 0 ? lower(word, locale) : capitalise(word, locale))).join('');
    case 'pascal':
      return words.map((word) => capitalise(word, locale)).join('');
    case 'snake':
      return words.map((word) => lower(word, locale)).join('_');
    case 'constant':
      return words.map((word) => upper(word, locale)).join('_');
    case 'kebab':
      return words.map((word) => lower(word, locale)).join('-');
    case 'dot':
      return words.map((word) => lower(word, locale)).join('.');
    case 'slug':
      return splitWords(stripAccents(words.join(' '))).map((word) => lower(word, locale)).join('-');
  }
}

/**
 * Converts one run of text between protected spans, keeping the whitespace
 * at either end so the run still sits apart from a link beside it.
 */
function convertRun(run: string, style: IdentifierStyle, locale: Locale): string {
  const words = splitWords(run);
  if (words.length === 0) return run;

  const lead = /^\s*/.exec(run)?.[0] ?? '';
  const trail = /\s*$/.exec(run)?.[0] ?? '';
  return lead + joinWords(words, style, locale) + trail;
}

function convertBody(body: string, style: IdentifierStyle, locale: Locale): string {
  let out = '';
  let last = 0;
  PROTECTED.lastIndex = 0;

  for (let match = PROTECTED.exec(body); match !== null; match = PROTECTED.exec(body)) {
    out += convertRun(body.slice(last, match.index), style, locale) + match[0];
    last = match.index + match[0].length;
  }

  return out + convertRun(body.slice(last), style, locale);
}

/**
 * Converts every line of `text` to one identifier style. Blank lines, lines
 * with no words and fenced code or `$$` blocks are left as they are.
 */
export function toIdentifierCase(
  text: string,
  style: IdentifierStyle,
  options: IdentifierOptions = {},
): string {
  const inBlock = blockTracker();

  return text.split('\n').map((line) => {
    if (inBlock(line)) return line;

    const match = LINE_PREFIX.exec(line);
    if (!match) return line;

    const [, prefix, body] = match;
    return prefix + convertBody(body, style, options.locale);
  }).join('\n');
}
