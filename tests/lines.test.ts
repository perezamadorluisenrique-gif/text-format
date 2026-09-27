import assert from 'node:assert/strict';
import test from 'node:test';

import { collapseBlankLines, removeBlankLines, removeDuplicateLines, sortLines } from '../src/lines.ts';

test('sorts naturally, ignoring case and accents', () => {
  assert.equal(sortLines('item 10\nItem 2\nélan\nzebra\napple'), 'apple\nélan\nItem 2\nitem 10\nzebra');
  assert.equal(sortLines('b\na\nc', 'desc'), 'c\nb\na');
});

test('keeps a trailing newline where it was', () => {
  assert.equal(sortLines('b\na\n'), 'a\nb\n');
});

test('compares list items by their text, not the bullet or checkbox', () => {
  assert.equal(sortLines('- [x] water plants\n- [ ] buy milk\n* call mum'), '- [ ] buy milk\n* call mum\n- [x] water plants');
});

test('moves sub-items with their parent', () => {
  const text = '- pears\n  - green\n  - red\n- apples\n  - gala';
  assert.equal(sortLines(text), '- apples\n  - gala\n- pears\n  - green\n  - red');
});

test('renumbers an ordered list', () => {
  assert.equal(sortLines('1. zeta\n2. alpha\n3. mid'), '1. alpha\n2. mid\n3. zeta');
  assert.equal(sortLines('4) b\n5) a'), '4) a\n5) b');
});

test('blank lines sort to the end instead of scattering', () => {
  assert.equal(sortLines('b\n\na'), 'a\nb\n');
});

test('removes duplicate lines after the first, but not blanks or code', () => {
  assert.equal(removeDuplicateLines('a\nb\na \n\n\nb\nc'), 'a\nb\n\n\nc');
  assert.equal(removeDuplicateLines('x\n```\nx\nx\n```\nx'), 'x\n```\nx\nx\n```');
});

test('removes blank lines outside code', () => {
  assert.equal(removeBlankLines('a\n\n  \nb\n```\n\n```\n'), 'a\nb\n```\n\n```\n');
});

test('collapses runs of blank lines to one', () => {
  assert.equal(collapseBlankLines('a\n\n\n\nb\n\nc'), 'a\n\nb\n\nc');
  assert.equal(collapseBlankLines('```\n\n\n```\n\n\nx'), '```\n\n\n```\n\nx');
});
