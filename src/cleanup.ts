/**
 * Cleaning up text that arrived from somewhere else: a PDF, a scan run
 * through OCR, a web page.
 *
 * These are deliberately *commands over a selection*, never a paste hook.
 * Several maintained plugins already rewrite the clipboard as it lands, and
 * silently editing what someone pastes is a different, riskier product.
 *
 * Nothing here imports `obsidian`, so it runs under plain Node.
 */

export interface JoinOptions {
  /**
   * Drop the hyphen when a word was broken across two lines. On by default,
   * because that is what a PDF does; see the note on `joinWrappedLines`.
   */
  removeHyphen?: boolean;
}

export interface LinkOptions {
  /** Replace `![alt](url)` with `alt` rather than removing it. On by default. */
  keepImageAltText?: boolean;
}

const FENCE = /^[ \t]*(?:```|~~~)/;

/** Lines that are structure, not prose, and so never merge with a neighbour. */
const STRUCTURAL = /^[ \t]*(?:#{1,6}[ \t]|={2,}[ \t]*$|-{3,}[ \t]*$|\*{3,}[ \t]*$|_{3,}[ \t]*$|\||[ \t]*$)/;

/** Quote markers, then a bullet or ordered marker, then an optional checkbox. */
const LINE_PREFIX =
  /^([ \t]*(?:>[ \t]*)*)((?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX/-][ \t]*\][ \t]+)?|#{1,6}[ \t]+)?([\s\S]*)$/;

/** A markdown hard line break: two trailing spaces, or a trailing backslash. */
const HARD_BREAK = /(?:[ \t]{2}|\\)$/;

const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/;

interface Line {
  raw: string;
  quote: string;
  marker: string;
  body: string;
  structural: boolean;
}

function readLine(raw: string): Line {
  const match = raw.match(LINE_PREFIX);
  const [, quote = '', marker = '', body = ''] = match ?? [];

  return {
    raw,
    quote,
    marker,
    body,
    structural: STRUCTURAL.test(raw) || FENCE.test(raw),
  };
}

/**
 * Merges the lines of a hard-wrapped paragraph back into one line.
 *
 * This is the command people reach for after copying a column of text out of
 * a PDF, and it is upstream issue #120. A line only absorbs the next one when
 * the next one is plain continuation prose: same quote depth, no bullet, no
 * heading, no table pipe, no blank line between them, and no markdown hard
 * break at the end of the first.
 *
 * A word split across the break (`trans-` / `lation`) is rejoined. That rule
 * cannot be perfect without a dictionary — a genuine compound like `well-` /
 * `known` is indistinguishable from a split word — so `removeHyphen` turns it
 * off for text where compounds are more likely than line breaks.
 */
export function joinWrappedLines(text: string, options: JoinOptions = {}): string {
  const lines = text.split('\n').map(readLine);
  const output: Line[] = [];
  let inFence = false;

  for (const line of lines) {
    if (FENCE.test(line.raw)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    const previous = output[output.length - 1];
    const canJoin =
      !inFence &&
      previous !== undefined &&
      !previous.structural &&
      !line.structural &&
      previous.body.trim().length > 0 &&
      line.body.trim().length > 0 &&
      line.marker === '' &&
      line.quote.trim() === previous.quote.trim() &&
      !HARD_BREAK.test(previous.body);

    if (!canJoin) {
      output.push(line);
      continue;
    }

    previous.body = joinBodies(previous.body, line.body.trim(), options);
  }

  return output.map((line) => line.quote + line.marker + line.body).join('\n');
}

function joinBodies(left: string, right: string, options: JoinOptions): string {
  const trimmed = left.replace(/[ \t]+$/, '');

  if (/\p{L}-$/u.test(trimmed) && /^\p{Ll}/u.test(right)) {
    return options.removeHyphen === false
      ? trimmed + right
      : trimmed.slice(0, -1) + right;
  }

  if (CJK.test(trimmed.slice(-1)) && CJK.test(right.slice(0, 1))) {
    return trimmed + right;
  }

  return `${trimmed} ${right}`;
}

/**
 * Rejoins words broken across a line break without otherwise rewrapping.
 *
 * Use this when the line breaks are wanted and only the hyphenation is not,
 * which is the usual shape of OCR output from a two-column scan.
 */
export function removeLineHyphenation(text: string): string {
  return text.replace(/(\p{L})-[ \t]*\n[ \t]*(\p{Ll})/gu, '$1$2');
}

/**
 * Characters that copy invisibly out of PDFs, scans and web pages.
 *
 * Soft hyphens and zero-width marks break search and spellcheck while looking
 * like nothing at all, and a non-breaking space is not the space markdown
 * parses. `U+3000`, the ideographic space, is left alone: in CJK text it is a
 * real character, not an artefact.
 */
export function removeInvisibles(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    // Written as escapes, with the zero-width joiner last, so the characters
    // stay visible in a diff and the class is not read as a joined sequence.
    .replace(/[\u00AD\u200B\u200C\u2060\uFEFF\u200D]/g, '')
    .replace(/[\u00A0\u2000-\u200A\u2007\u202F\u205F]/g, ' ');
}

/**
 * Replaces every link with the text it displays.
 *
 * Written as a scanner rather than a regex because the two upstream bugs here
 * are both nesting: `#` inside a wikilink (#103) and brackets or parentheses
 * inside a markdown link, which leave fragments behind (#115).
 */
export function linksToPlainText(text: string, options: LinkOptions = {}): string {
  return eachProseSegment(text, (segment) => stripLinks(segment, options));
}

/** Runs `fn` over everything that is not fenced or inline code. */
function eachProseSegment(text: string, fn: (segment: string) => string): string {
  let inFence = false;

  return text.split('\n').map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    return line
      .split(/(`+[^`]*`+)/)
      .map((part, index) => (index % 2 === 1 ? part : fn(part)))
      .join('');
  }).join('\n');
}

/** Index of the delimiter closing the one at `start`, or -1. */
function matchDelimiter(text: string, start: number, open: string, close: string): number {
  let depth = 0;

  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '\\') {
      i += 1;
      continue;
    }
    if (text[i] === open) depth += 1;
    else if (text[i] === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

/** `note#heading` stays readable; `note|alias` shows the alias. */
function wikilinkText(inner: string): string {
  const pipe = inner.indexOf('|');

  return (pipe === -1 ? inner : inner.slice(pipe + 1)).trim();
}

function stripLinks(text: string, options: LinkOptions): string {
  const keepAlt = options.keepImageAltText !== false;
  let out = '';
  let i = 0;

  while (i < text.length) {
    const rest = text.slice(i);

    if (text[i] === '\\') {
      out += text.slice(i, i + 2);
      i += 2;
      continue;
    }

    if (rest.startsWith('[[') || rest.startsWith('![[')) {
      const isEmbed = rest.startsWith('!');
      const open = i + (isEmbed ? 1 : 0);
      const close = text.indexOf(']]', open + 2);

      if (close !== -1) {
        out += wikilinkText(text.slice(open + 2, close));
        i = close + 2;
        continue;
      }
    }

    if (text[i] === '<') {
      const close = text.indexOf('>', i + 1);
      const inner = close === -1 ? '' : text.slice(i + 1, close);

      if (close !== -1 && /^(?:https?:\/\/|mailto:)\S+$/.test(inner)) {
        out += inner.replace(/^mailto:/, '');
        i = close + 1;
        continue;
      }
    }

    if (text[i] === '[' || (text[i] === '!' && text[i + 1] === '[')) {
      const isImage = text[i] === '!';
      const open = isImage ? i + 1 : i;
      const labelEnd = matchDelimiter(text, open, '[', ']');
      const after = labelEnd === -1 ? '' : text[labelEnd + 1];

      if (labelEnd !== -1 && (after === '(' || after === '[')) {
        const targetEnd = after === '('
          ? matchDelimiter(text, labelEnd + 1, '(', ')')
          : matchDelimiter(text, labelEnd + 1, '[', ']');

        if (targetEnd !== -1) {
          const label = stripLinks(text.slice(open + 1, labelEnd), options);
          out += isImage && !keepAlt ? '' : label;
          i = targetEnd + 1;
          continue;
        }
      }
    }

    out += text[i];
    i += 1;
  }

  return out;
}
