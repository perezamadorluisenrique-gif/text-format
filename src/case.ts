/**
 * The case commands, as pure functions over a string.
 *
 * Every one of them is line aware: it finds the markdown prefix of each line
 * (quote markers, bullets, ordered numbers, task checkboxes, heading hashes)
 * and leaves it alone, and it skips fenced code blocks entirely. That is what
 * keeps `- [x] task` a ticked task instead of turning it into `- [X] Task`,
 * which is upstream issue #112.
 */

import {
  type Locale,
  blockTracker,
  type Token,
  capitalise,
  isAcronym,
  lower,
  render,
  tokenize,
  upper,
} from './segments.ts';

export interface CaseOptions {
  /** A BCP 47 tag when the language needs its own case rules, e.g. `tr`. */
  locale?: Locale;
  /** Leave runs like `NASA` and `PDF` as they are. On by default. */
  preserveAcronyms?: boolean;
  /** Words title case keeps lower, unless they open or close the title. */
  stopWords?: string[];
}

/**
 * Practical rather than doctrinaire: articles, coordinating conjunctions and
 * the common prepositions. Editable in the settings, because no two style
 * guides agree on this list.
 */
export const DEFAULT_STOP_WORDS = [
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as',
  'at', 'by', 'down', 'from', 'in', 'into', 'like', 'near', 'of', 'off',
  'on', 'onto', 'over', 'past', 'per', 'to', 'up', 'upon', 'via', 'with',
  'vs', 'v', 'versus', 'than', 'en',
];

/**
 * A line's leading markdown furniture, which no case command may rewrite.
 * Group 1 is that prefix, group 2 is the text the command actually works on.
 */
const LINE_PREFIX =
  /^([ \t]*(?:>[ \t]*)*(?:(?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX/-][ \t]*\][ \t]+)?|#{1,6}[ \t]+)?)([\s\S]*)$/;

/**
 * A separator that closes a sentence: terminal punctuation, then any closing
 * quotes or brackets, then whitespace or the end of the line.
 */
const SENTENCE_END = /[.!?…][)"'’”\]]*(?:\s|$)/;

interface LineContext {
  sentenceStart: boolean;
}

type LineFn = (body: string, context: LineContext) => string;

function mapLines(text: string, fn: LineFn): string {
  const context: LineContext = { sentenceStart: true };
  const inBlock = blockTracker();

  return text.split('\n').map((line) => {
    if (inBlock(line)) {
      context.sentenceStart = true;
      return line;
    }

    const match = line.match(LINE_PREFIX);
    if (!match) return line;

    const [, prefix, body] = match;

    // A blank line ends whatever sentence was running; so does a line that
    // starts a new list item, quote or heading.
    if (body.trim().length === 0) {
      context.sentenceStart = true;
      return line;
    }
    if (prefix.trim().length > 0) {
      context.sentenceStart = true;
    }

    return prefix + fn(body, context);
  }).join('\n');
}

function mapWords(
  text: string,
  options: CaseOptions,
  fn: (word: string, index: number, tokens: Token[]) => string,
): string {
  return mapLines(text, (body) => {
    const tokens = tokenize(body);
    // Positions count every token with content, not only words, so a title
    // ending in a file name or a URL does not capitalise the stop word
    // before it as if that were the last word.
    const content = tokens.filter((token) => token.kind !== 'separator');

    content.forEach((token, index) => {
      if (token.kind === 'word') token.text = fn(token.text, index, content);
    });

    return render(tokens);
  });
}

function keepsCase(word: string, options: CaseOptions): boolean {
  return options.preserveAcronyms !== false && isAcronym(word, options.locale);
}

/**
 * All-capitals input leaves the acronym rule nothing to tell apart: every
 * word looks like `NASA`. Title, word and sentence case therefore drop the
 * rule when the whole selection is shouting, which is the very text people
 * reach for these commands to fix.
 */
function resolveOptions(text: string, options: CaseOptions): CaseOptions {
  if (options.preserveAcronyms === false) return options;
  if (text === lower(text, options.locale)) return options;
  if (text !== upper(text, options.locale)) return options;

  return { ...options, preserveAcronyms: false };
}

/** UPPER CASE. Protected spans and fenced code are copied through. */
export function toUpperCase(text: string, options: CaseOptions = {}): string {
  return mapLines(text, (body) => {
    const tokens = tokenize(body);
    for (const token of tokens) {
      if (token.kind === 'protected') continue;
      token.text = upper(token.text, options.locale);
    }
    return render(tokens);
  });
}

/** lower case. */
export function toLowerCase(text: string, options: CaseOptions = {}): string {
  return mapLines(text, (body) => {
    const tokens = tokenize(body);
    for (const token of tokens) {
      if (token.kind === 'protected') continue;
      token.text = lower(token.text, options.locale);
    }
    return render(tokens);
  });
}

/** Capitalise Every Word. */
export function capitalizeWords(text: string, options: CaseOptions = {}): string {
  options = resolveOptions(text, options);

  return mapWords(text, options, (word) =>
    keepsCase(word, options) ? word : capitalise(word, options.locale));
}

/**
 * Title Case, with the stop words kept lower.
 *
 * The first and last word are always capitalised even when they are stop
 * words, which is upstream issue #121: there, a title opening with `The` came
 * out as `the` because the ignore list was applied without checking position.
 */
export function toTitleCase(text: string, options: CaseOptions = {}): string {
  options = resolveOptions(text, options);

  const stopWords = new Set(
    (options.stopWords ?? DEFAULT_STOP_WORDS).map((word) => word.toLowerCase()),
  );

  return mapWords(text, options, (word, index, tokens) => {
    if (keepsCase(word, options)) return word;

    const isEdge = index === 0 || index === tokens.length - 1;
    if (!isEdge && stopWords.has(word.toLowerCase())) {
      return lower(word, options.locale);
    }

    return capitalise(word, options.locale);
  });
}

function sentenceCase(text: string, options: CaseOptions, flatten: boolean): string {
  options = resolveOptions(text, options);

  return mapLines(text, (body, context) => {
    const tokens = tokenize(body);

    for (const token of tokens) {
      if (token.kind === 'separator') {
        if (SENTENCE_END.test(token.text)) context.sentenceStart = true;
        continue;
      }

      // `e.g.` and `3.14` are single tokens, so they neither end a sentence
      // nor lose their own capitals.
      if (token.kind === 'protected' || token.kind === 'atomic') {
        context.sentenceStart = false;
        continue;
      }

      if (keepsCase(token.text, options)) {
        context.sentenceStart = false;
        continue;
      }

      if (context.sentenceStart) {
        token.text = flatten
          ? capitalise(token.text, options.locale)
          : upper(Array.from(token.text)[0], options.locale) +
            Array.from(token.text).slice(1).join('');
      } else if (flatten) {
        token.text = lower(token.text, options.locale);
      }

      context.sentenceStart = false;
    }

    return render(tokens);
  });
}

/** Sentence case: everything down, then the first word of each sentence up. */
export function toSentenceCase(text: string, options: CaseOptions = {}): string {
  return sentenceCase(text, options, true);
}

/**
 * Capitalise the first word of each sentence and change nothing else, so
 * proper nouns already typed survive.
 */
export function capitalizeSentences(text: string, options: CaseOptions = {}): string {
  return sentenceCase(text, options, false);
}

/**
 * lower case -> Title Case -> UPPER CASE -> lower case.
 *
 * Whatever the text currently matches decides the next step, so pressing the
 * same hotkey repeatedly walks the cycle.
 */
export function cycleCase(text: string, options: CaseOptions = {}): string {
  // Acronyms are held still by every other command; here they must move, or
  // an all-capitals selection would match its own title case and never leave
  // the UPPER step.
  const cycling: CaseOptions = { ...options, preserveAcronyms: false };

  if (text === toLowerCase(text, cycling)) return toTitleCase(text, cycling);
  if (text === toTitleCase(text, cycling)) return toUpperCase(text, cycling);

  return toLowerCase(text, cycling);
}
