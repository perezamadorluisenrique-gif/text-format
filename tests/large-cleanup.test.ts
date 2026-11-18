import assert from 'node:assert/strict';
import test from 'node:test';

import { LARGE_CHARS, LARGE_LINES, isLargeCleanup, sizeOf } from '../src/large-cleanup.ts';

test('a few lines are not a large cleanup', () => {
  assert.equal(isLargeCleanup(sizeOf(['one\ntwo\nthree'])), false);
  assert.equal(isLargeCleanup(sizeOf([])), false);
  assert.equal(isLargeCleanup(sizeOf([''])), false);
});

test('40 lines is large, 39 is not', () => {
  assert.equal(isLargeCleanup(sizeOf([Array(LARGE_LINES).fill('x').join('\n')])), true);
  assert.equal(isLargeCleanup(sizeOf([Array(LARGE_LINES - 1).fill('x').join('\n')])), false);
});

test('3,000 characters is large even on one line, 2,999 is not', () => {
  assert.equal(isLargeCleanup(sizeOf(['a'.repeat(LARGE_CHARS)])), true);
  assert.equal(isLargeCleanup(sizeOf(['a'.repeat(LARGE_CHARS - 1)])), false);
});

test('several selections add up', () => {
  const piece = Array(20).fill('x').join('\n');
  assert.equal(sizeOf([piece, piece]).lines, 40);
  assert.equal(isLargeCleanup(sizeOf([piece, piece])), true);
  assert.equal(isLargeCleanup(sizeOf([piece])), false);
});
