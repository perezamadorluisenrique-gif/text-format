/**
 * Properties that hold for any note, checked on hand-written notes in the
 * style of the Obsidian help vault and on a couple of thousand generated
 * ones. The commands run on the note body, as `main.ts` runs them when the
 * whole note is selected: the front matter is never passed in.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { capitalizeSentences, capitalizeWords, toLowerCase, toSentenceCase, toTitleCase, toUpperCase } from '../src/case.ts';
import { eachProseSegment, joinWrappedLines, removeInvisibles, replaceLigatures } from '../src/cleanup.ts';
import { collapseBlankLines, removeBlankLines, removeDuplicateLines, sortLines } from '../src/lines.ts';
import { frontmatterLineCount } from '../src/segments.ts';
import { TIDY_STEPS, collapseMultipleSpaces, removeTrailingWhitespace, tidy } from '../src/tidy.ts';
import { SAMPLES, protectedPieces, randomNote } from './markdown-samples.ts';

function body(note: string): string {
  const lines = note.replace(/\r/g, '').split('\n');
  return lines.slice(frontmatterLineCount((i) => lines[i])).join('\n');
}

const NOTES: [string, string][] = [
  ...Object.entries(SAMPLES),
  ...Array.from({ length: 2000 }, (_, i): [string, string] => [`seed ${i + 1}`, randomNote(i + 1)]),
].map(([name, note]) => [name, body(note)]);

const CASES: Record<string, (text: string) => string> = {
  upper: toUpperCase,
  lower: toLowerCase,
  title: toTitleCase,
  sentence: toSentenceCase,
  words: capitalizeWords,
  sentences: capitalizeSentences,
};

const WHITESPACE: Record<string, (text: string) => string> = {
  spaces: collapseMultipleSpaces,
  trailing: removeTrailingWhitespace,
  invisibles: (text) => eachProseSegment(text, removeInvisibles),
  ligatures: replaceLigatures,
};

const TIDY: Record<string, (text: string) => string> = {
  tidy: (text) => tidy(text, { steps: TIDY_STEPS }).text,
  'tidy without hard breaks': (text) => tidy(text, { steps: TIDY_STEPS, keepHardBreaks: false }).text,
  'remove duplicate lines': removeDuplicateLines,
  'remove blank lines': removeBlankLines,
  'collapse blank lines': collapseBlankLines,
  sort: (text) => sortLines(text),
};

/**
 * Code, maths, links, URLs and HTML. HTML comments are prose that happens
 * to be hidden, and a link's title is prose too, so neither is compared.
 * The body has no front matter, so a `---` on its first line is a rule.
 */
const untouchable = (text: string) =>
  protectedPieces(`\n${text}`).filter((p) => !p.startsWith('<!--') && !/^\]\(\S* "/.test(p));

/** Fenced code and display maths, which no command may change, move or merge. */
const blocks = (text: string) => protectedPieces(`\n${text}`).filter((p) => /^[ \t>]*(```|~~~|\$\$)/.test(p) && p.includes('\n'));

test('every case and whitespace command is idempotent and keeps the line count', () => {
  for (const [command, fn] of Object.entries({ ...CASES, ...WHITESPACE })) {
    for (const [name, note] of NOTES) {
      const once = fn(note);
      assert.equal(fn(once), once, `${command}: ${name}`);
      assert.equal(once.split('\n').length, note.split('\n').length, `${command}: ${name}`);
    }
  }
});

test('the case and whitespace commands leave code, maths, links, URLs and HTML alone', () => {
  for (const [command, fn] of Object.entries({ ...CASES, ...WHITESPACE })) {
    for (const [name, note] of NOTES) {
      assert.deepEqual(untouchable(fn(note)), untouchable(note), `${command}: ${name}`);
    }
  }
});

test('tidy and the line commands are idempotent', () => {
  for (const [command, fn] of Object.entries(TIDY)) {
    for (const [name, note] of NOTES) {
      const once = fn(note);
      assert.equal(fn(once), once, `${command}: ${name}`);
    }
  }
});

test('joining, tidying and removing lines never touch a code or maths block', () => {
  const commands = { join: (text: string) => joinWrappedLines(text), ...TIDY };
  delete (commands as Record<string, unknown>).sort;
  for (const [command, fn] of Object.entries(commands)) {
    for (const [name, note] of NOTES) {
      assert.deepEqual(blocks(fn(note)), blocks(note), `${command}: ${name}`);
    }
  }
});

test('sorting keeps every line', () => {
  for (const [name, note] of NOTES) {
    const lines = (text: string) => text.split('\n').filter((l) => l.trim() !== '').sort();
    assert.deepEqual(lines(sortLines(note)), lines(note), name);
  }
});

test('upper then lower case equals lower case', () => {
  for (const [name, note] of NOTES) {
    assert.equal(toLowerCase(toUpperCase(note)), toLowerCase(note), name);
  }
});
