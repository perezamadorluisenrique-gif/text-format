import assert from 'node:assert/strict';
import test from 'node:test';

import {
  joinWrappedLines,
  linksToPlainText,
  removeInvisibles,
  removeLineHyphenation,
} from '../src/cleanup.ts';

test('joinWrappedLines merges a hard-wrapped paragraph', () => {
  assert.equal(
    joinWrappedLines('This is a sentence\nsplit across three\nshort lines.'),
    'This is a sentence split across three short lines.',
  );
});

test('joinWrappedLines keeps paragraphs apart', () => {
  assert.equal(
    joinWrappedLines('One line\nwrapped.\n\nA second\nparagraph.'),
    'One line wrapped.\n\nA second paragraph.',
  );
});

test('joinWrappedLines does not swallow list items', () => {
  const text = '- first item\n- second item\n- third item';

  assert.equal(joinWrappedLines(text), text);
});

test('joinWrappedLines unwraps a list item onto its own marker', () => {
  assert.equal(
    joinWrappedLines('- an item that runs\n  onto a second line\n- next item'),
    '- an item that runs onto a second line\n- next item',
  );
});

test('joinWrappedLines leaves headings, tables and rules alone', () => {
  const text = '# Heading\nprose under it\n\n| a | b |\n| - | - |\n\n---\nafter';

  assert.equal(
    joinWrappedLines(text),
    '# Heading\nprose under it\n\n| a | b |\n| - | - |\n\n---\nafter',
  );
});

test('joinWrappedLines respects a markdown hard break', () => {
  const text = 'first line  \nsecond line';

  assert.equal(joinWrappedLines(text), text);
});

test('joinWrappedLines leaves fenced code untouched', () => {
  const text = 'prose\n\n```\nconst a = 1;\nconst b = 2;\n```\n\nmore\nprose';

  assert.equal(
    joinWrappedLines(text),
    'prose\n\n```\nconst a = 1;\nconst b = 2;\n```\n\nmore prose',
  );
});

test('joinWrappedLines merges a quote at the same depth', () => {
  assert.equal(
    joinWrappedLines('> a quote that\n> wraps'),
    '> a quote that wraps',
  );
});

test('joinWrappedLines rejoins a word split across the break', () => {
  assert.equal(
    joinWrappedLines('an incomplete trans-\nlation of the text'),
    'an incomplete translation of the text',
  );
});

test('joinWrappedLines can keep the hyphen instead', () => {
  assert.equal(
    joinWrappedLines('a well-\nknown result', { removeHyphen: false }),
    'a well-known result',
  );
});

test('joinWrappedLines adds no space between CJK characters', () => {
  assert.equal(joinWrappedLines('你好\n世界'), '你好世界');
});

test('removeLineHyphenation keeps the line breaks', () => {
  assert.equal(
    removeLineHyphenation('an incomplete trans-\nlation here'),
    'an incomplete translation here',
  );
  assert.equal(
    removeLineHyphenation('a list -\nnot a word'),
    'a list -\nnot a word',
  );
});

test('removeInvisibles strips soft hyphens and zero-width marks', () => {
  assert.equal(removeInvisibles('so­ft hy​phen'), 'soft hyphen');
});

test('removeInvisibles turns exotic spaces into ordinary ones', () => {
  assert.equal(removeInvisibles('a b c d'), 'a b c d');
});

test('removeInvisibles leaves the ideographic space alone', () => {
  assert.equal(removeInvisibles('你　好'), '你　好');
});

test('removeInvisibles normalises carriage returns', () => {
  assert.equal(removeInvisibles('a\r\nb\rc'), 'a\nb\nc');
});

test('linksToPlainText unwraps a markdown link', () => {
  assert.equal(
    linksToPlainText('see [the docs](https://example.com) now'),
    'see the docs now',
  );
});

test('linksToPlainText survives brackets and parentheses inside a link', () => {
  // Upstream #115: these left fragments behind.
  assert.equal(
    linksToPlainText('[a [nested] label](https://example.com/a(b)c)'),
    'a [nested] label',
  );
  assert.equal(
    linksToPlainText('[it (2020)](https://example.com/x_(y))'),
    'it (2020)',
  );
});

test('linksToPlainText handles a wikilink containing a heading', () => {
  // Upstream #103: the `#` stopped it working.
  assert.equal(linksToPlainText('[[Note#Heading]]'), 'Note#Heading');
  assert.equal(linksToPlainText('[[Note|an alias]]'), 'an alias');
  assert.equal(linksToPlainText('[[Note]] and [[Other]]'), 'Note and Other');
});

test('linksToPlainText unwraps an autolink and an e-mail', () => {
  assert.equal(linksToPlainText('<https://example.com>'), 'https://example.com');
  assert.equal(linksToPlainText('<mailto:a@example.com>'), 'a@example.com');
});

test('linksToPlainText keeps image alt text by default', () => {
  assert.equal(linksToPlainText('before ![a chart](chart.png) after'),
    'before a chart after');
  assert.equal(
    linksToPlainText('before ![a chart](chart.png) after', { keepImageAltText: false }),
    'before  after',
  );
});

test('linksToPlainText leaves code alone', () => {
  assert.equal(
    linksToPlainText('use `[label](url)` in markdown'),
    'use `[label](url)` in markdown',
  );
  assert.equal(
    linksToPlainText('```\n[label](url)\n```'),
    '```\n[label](url)\n```',
  );
});

test('linksToPlainText leaves plain brackets and bare URLs alone', () => {
  assert.equal(linksToPlainText('a [note] to self'), 'a [note] to self');
  assert.equal(linksToPlainText('see https://example.com'), 'see https://example.com');
  assert.equal(linksToPlainText('an \\[escaped] bracket'), 'an \\[escaped] bracket');
});

test('linksToPlainText unwraps a reference-style link', () => {
  assert.equal(linksToPlainText('see [the docs][docs] now'), 'see the docs now');
});

test('linksToPlainText leaves an unclosed link as typed', () => {
  assert.equal(linksToPlainText('a [half open link'), 'a [half open link');
});
