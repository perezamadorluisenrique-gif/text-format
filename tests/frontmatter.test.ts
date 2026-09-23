import assert from 'node:assert/strict';
import test from 'node:test';

import { frontmatterLineCount } from '../src/segments.ts';

const count = (text: string) => {
  const lines = text.split('\n');
  return frontmatterLineCount((i) => lines[i]);
};

test('frontmatter is counted with both fences', () => {
  assert.equal(count('---\ntitle: My note\ntags: [a]\n---\nBody'), 4);
  assert.equal(count('---\n---\nBody'), 2);
});

test('YAML may close with ...', () => {
  assert.equal(count('---\ntitle: x\n...\nBody'), 3);
});

test('no frontmatter unless --- is the very first line', () => {
  assert.equal(count('Body\n---\ntitle: x\n---'), 0);
  assert.equal(count(''), 0);
});

test('an unclosed --- is a horizontal rule, not frontmatter', () => {
  assert.equal(count('---\nJust a note under a rule'), 0);
});
