import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TIDY_STEPS,
  collapseMultipleSpaces,
  countChangedLines,
  endsInsideCode,
  removeTrailingWhitespace,
  tidy,
  wordRangeAt,
} from '../src/tidy.ts';

test('trailing whitespace goes, including on whitespace-only lines', () => {
  assert.equal(removeTrailingWhitespace('a  \t\n   \nb '), 'a\n\nb');
});

test('two trailing spaces before another line are a hard break and stay', () => {
  assert.equal(removeTrailingWhitespace('one  \ntwo'), 'one  \ntwo');
  assert.equal(removeTrailingWhitespace('one      \ntwo'), 'one  \ntwo');
  assert.equal(removeTrailingWhitespace('> one  \n> two'), '> one  \n> two');
});

test('a hard break that breaks nothing is removed', () => {
  assert.equal(removeTrailingWhitespace('one  \n\ntwo  '), 'one\n\ntwo');
  assert.equal(removeTrailingWhitespace('# Title  \ntext'), '# Title\ntext');
});

test('hard breaks can be turned off', () => {
  assert.equal(removeTrailingWhitespace('one  \ntwo', { keepHardBreaks: false }), 'one\ntwo');
});

test('trailing whitespace in fenced code stays', () => {
  const text = '```\ncode   \n```\nprose   ';
  assert.equal(removeTrailingWhitespace(text), '```\ncode   \n```\nprose');
});

test('collapses runs of spaces between words', () => {
  assert.equal(collapseMultipleSpaces('a   b    c'), 'a b c');
});

test('keeps indentation, list markers, quote markers and checkboxes', () => {
  assert.equal(collapseMultipleSpaces('    - a   b'), '    - a b');
  assert.equal(collapseMultipleSpaces('1.   a   b'), '1.   a b');
  assert.equal(collapseMultipleSpaces('> >   a   b'), '> >   a b');
  assert.equal(collapseMultipleSpaces('- [ ]   a   b'), '- [ ]   a b');
});

test('keeps a trailing hard break while collapsing the rest', () => {
  assert.equal(collapseMultipleSpaces('a   b  \nc'), 'a b  \nc');
});

test('leaves table rows, inline code, wikilinks and fenced code alone', () => {
  const table = '| a   | b |\n| --- | - |\n| 1   | 2 |';
  assert.equal(collapseMultipleSpaces(table), table);
  assert.equal(collapseMultipleSpaces('x  `a   b`  [[c   d]]  y'), 'x `a   b` [[c   d]] y');
  assert.equal(collapseMultipleSpaces('```\na   b\n```'), '```\na   b\n```');
});

test('a table without outer pipes is still a table', () => {
  const table = 'a   | b\n--- | ---\n1   | 2';
  assert.equal(collapseMultipleSpaces(table), table);
});

test('indented code after a paragraph is code, a list continuation is not', () => {
  assert.equal(collapseMultipleSpaces('para\n\n    a   b'), 'para\n\n    a   b');
  assert.equal(collapseMultipleSpaces('- item\n\n    a   b'), '- item\n\n    a b');
});

test('tidy runs the chosen steps and reports what each changed', () => {
  const input = 'ﬁle one   two  \n\n\n\nnext​';
  const result = tidy(input, { steps: TIDY_STEPS });
  assert.equal(result.text, 'file one two\n\nnext');
  assert.deepEqual(result.report.map((r) => r.step), ['invisibles', 'ligatures', 'spaces', 'trailing', 'blank']);
});

test('tidy skips steps that were not chosen', () => {
  const result = tidy('a   b  ', { steps: ['trailing'] });
  assert.equal(result.text, 'a   b');
  assert.deepEqual(result.report, [{ step: 'trailing', count: 1 }]);
});

test('tidy joins wrapped lines only when asked, and keeps hard breaks', () => {
  const input = 'one\ntwo  \nthree\n\nfour';
  assert.equal(tidy(input, { steps: ['trailing'] }).text, input);
  assert.equal(tidy(input, { steps: ['join'] }).text, 'one two  \nthree\n\nfour');
});

test('tidy leaves code, maths and quoted code untouched', () => {
  const input = '```js\nlet  a = ﬁ;   \n\n\n\nb c\n```\n\n$$\na   b\n$$\n\ntext   `x  y`';
  const out = tidy(input, { steps: TIDY_STEPS }).text;
  assert.equal(out, '```js\nlet  a = ﬁ;   \n\n\n\nb c\n```\n\n$$\na   b\n$$\n\ntext `x  y`');
});

test('tidy converts CRLF and reports nothing for clean text', () => {
  assert.equal(tidy('a\r\nb', { steps: ['trailing'] }).text, 'a\nb');
  assert.deepEqual(tidy('clean\n\ntext', { steps: TIDY_STEPS }).report, []);
});

test('tidy keeps nested blockquotes and list nesting', () => {
  const input = '> a\n> > b   c\n\n- x\n    - y   z';
  assert.equal(tidy(input, { steps: TIDY_STEPS }).text, '> a\n> > b c\n\n- x\n    - y z');
});

test('counts changed lines, or lines lost when the count differs', () => {
  assert.equal(countChangedLines('a\nb', 'a\nb'), 0);
  assert.equal(countChangedLines('a \nb \nc', 'a\nb\nc'), 2);
  assert.equal(countChangedLines('a\n\n\n\nb', 'a\n\nb'), 2);
});

test('knows when the caret is inside code', () => {
  assert.equal(endsInsideCode('text\n```js\nlet a'), true);
  assert.equal(endsInsideCode('```\ncode\n```\ntext'), false);
  assert.equal(endsInsideCode('text `inline co'), true);
  assert.equal(endsInsideCode('text `done` more'), false);
  assert.equal(endsInsideCode('$$\nx'), true);
});

test('finds the word under or next to the caret', () => {
  assert.deepEqual(wordRangeAt('hello big world', 7), [6, 9]);
  assert.deepEqual(wordRangeAt('hello big world', 9), [6, 9]);
  assert.deepEqual(wordRangeAt("it's don't", 6), [5, 10]);
  assert.equal(wordRangeAt('a  b', 2), null);
  assert.equal(wordRangeAt('', 0), null);
});
