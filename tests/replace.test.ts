import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type SavedReplacement,
  buildPattern,
  newReplacementId,
  normalizeReplacements,
  replacementCommandName,
  replacementError,
  runReplacement,
} from '../src/replace.ts';

const rep = (over: Partial<SavedReplacement>): SavedReplacement => ({
  id: 'abc123',
  name: 'Test',
  find: '',
  replace: '',
  regex: false,
  matchCase: false,
  ...over,
});

test('plain text replaces every match and counts them', () => {
  const result = runReplacement('cat and cat', rep({ find: 'cat', replace: 'dog' }));
  assert.deepEqual(result, { text: 'dog and dog', count: 2 });
});

test('plain text ignores case unless match case is on', () => {
  assert.equal(runReplacement('Cat cat CAT', rep({ find: 'cat', replace: 'x' })).text, 'x x x');
  const exact = runReplacement('Cat cat CAT', rep({ find: 'cat', replace: 'x', matchCase: true }));
  assert.deepEqual(exact, { text: 'Cat x CAT', count: 1 });
});

test('plain text is literal: dots, brackets, $ and backslashes mean themselves', () => {
  assert.equal(runReplacement('a.b (c) a-b', rep({ find: 'a.b', replace: '$1\\n' })).text, '$1\\n (c) a-b');
  assert.equal(runReplacement('x [y] z', rep({ find: '[y]', replace: '(y)' })).text, 'x (y) z');
});

test('zero matches change nothing and count zero', () => {
  const result = runReplacement('nothing here', rep({ find: 'zebra', replace: 'x' }));
  assert.deepEqual(result, { text: 'nothing here', count: 0 });
});

test('a match replaced by itself is not counted', () => {
  assert.deepEqual(runReplacement('cat', rep({ find: 'cat', replace: 'cat', matchCase: true })), { text: 'cat', count: 0 });
});

test('fenced code, inline code and display maths are left alone', () => {
  const text = 'cat `cat` cat\n```js\ncat\n```\n$$\ncat\n$$\ncat';
  const result = runReplacement(text, rep({ find: 'cat', replace: 'dog' }));
  assert.equal(result.text, 'dog `cat` dog\n```js\ncat\n```\n$$\ncat\n$$\ndog');
  assert.equal(result.count, 3);
});

test('a longer fence is not closed by a shorter one', () => {
  const text = '````\n```\ncat\n```\n````\ncat';
  assert.equal(runReplacement(text, rep({ find: 'cat', replace: 'dog' })).text, '````\n```\ncat\n```\n````\ndog');
});

test('regex groups: $1, $2, $& and $$', () => {
  const swap = rep({ regex: true, find: '(\\w+) (\\w+)', replace: '$2 $1' });
  assert.equal(runReplacement('hello world', swap).text, 'world hello');
  assert.equal(runReplacement('ab', rep({ regex: true, find: 'a', replace: '[$&]' })).text, '[a]b');
  assert.equal(runReplacement('ab', rep({ regex: true, find: 'a', replace: '$$1' })).text, '$1b');
});

test('regex: a group that does not exist stays as typed; $10 falls back to $1 then 0', () => {
  assert.equal(runReplacement('ab', rep({ regex: true, find: '(a)', replace: '$2' })).text, '$2b');
  assert.equal(runReplacement('ab', rep({ regex: true, find: '(a)', replace: '$10' })).text, 'a0b');
});

test('regex: named groups', () => {
  const r = rep({ regex: true, find: '(?<y>\\d{4})-(?<m>\\d\\d)', replace: '$<m>/$<y>' });
  assert.equal(runReplacement('on 2026-10', r).text, 'on 10/2026');
});

test('regex: \\n in the replace text is a line break, \\t a tab', () => {
  const r = rep({ regex: true, find: ', ', replace: ',\\n' });
  assert.deepEqual(runReplacement('a, b, c', r), { text: 'a,\nb,\nc', count: 2 });
  assert.equal(runReplacement('a b', rep({ regex: true, find: ' ', replace: '\\t' })).text, 'a\tb');
  assert.equal(runReplacement('a b', rep({ regex: true, find: ' ', replace: '\\\\' })).text, 'a\\b');
});

test('regex honours match case, and anchors work per line', () => {
  assert.equal(runReplacement('Abc abc', rep({ regex: true, find: 'abc', replace: 'x' })).text, 'x x');
  assert.equal(runReplacement('Abc abc', rep({ regex: true, find: 'abc', replace: 'x', matchCase: true })).text, 'Abc x');
  assert.equal(runReplacement('one\ntwo', rep({ regex: true, find: '^', replace: '- ' })).text, '- one\n- two');
  assert.equal(runReplacement('a  \nb ', rep({ regex: true, find: ' +$', replace: '' })).text, 'a\nb');
});

test('unicode property escapes work in regex mode', () => {
  assert.equal(runReplacement('año 5', rep({ regex: true, find: '\\p{L}+', replace: 'w' })).text, 'w 5');
});

test('an empty-match pattern does not loop and is not counted when nothing changes', () => {
  assert.deepEqual(runReplacement('abc', rep({ regex: true, find: 'x*', replace: '' })), { text: 'abc', count: 0 });
});

test('an invalid regex reports an error and leaves the text alone', () => {
  const r = rep({ regex: true, find: '(unclosed', replace: 'x' });
  assert.match(replacementError(r) ?? '', /^Not a valid regular expression/);
  assert.deepEqual(runReplacement('(unclosed', r), {
    text: '(unclosed',
    count: 0,
    error: replacementError(r) ?? '',
  });
  // The same text is fine as plain text.
  assert.equal(replacementError({ ...r, regex: false }), null);
});

test('empty find text is an error, not a replace-everywhere', () => {
  assert.equal(replacementError(rep({ find: '' })), 'Find text is empty.');
  assert.equal(runReplacement('abc', rep({ find: '' })).count, 0);
  assert.equal(typeof buildPattern(rep({ find: '' })), 'string');
});

test('an empty replace text deletes the matches', () => {
  assert.deepEqual(runReplacement('a-b-c', rep({ find: '-' })), { text: 'abc', count: 2 });
});

test('matches stay within a line', () => {
  assert.equal(runReplacement('a\nb', rep({ regex: true, find: 'a\\nb', replace: 'x' })).text, 'a\nb');
});

test('normalizeReplacements drops junk, duplicates and wrong types', () => {
  const list = normalizeReplacements([
    { id: 'a', name: 'A', find: 'x', replace: 'y', regex: true, matchCase: true },
    { id: 'a', name: 'Dup' },
    { id: '', name: 'No id' },
    { name: 'No id either' },
    null,
    'text',
    { id: 'b', name: 5, find: null, regex: 'yes' },
  ]);
  assert.deepEqual(list, [
    { id: 'a', name: 'A', find: 'x', replace: 'y', regex: true, matchCase: true },
    { id: 'b', name: '', find: '', replace: '', regex: false, matchCase: false },
  ]);
  assert.deepEqual(normalizeReplacements(undefined), []);
  assert.deepEqual(normalizeReplacements({}), []);
});

test('new ids avoid the ones in use and are command-safe', () => {
  const taken = [rep({ id: '000000' })];
  const id = newReplacementId(taken, () => 0);
  assert.notEqual(id, '000000');
  assert.match(newReplacementId([]), /^[a-z0-9]{6}$/);
});

test('command name', () => {
  assert.equal(replacementCommandName(rep({ name: '  Fix dashes ' })), 'Replace: Fix dashes');
});
