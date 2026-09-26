import assert from 'node:assert/strict';
import test from 'node:test';

import { splitWords, stripAccents, toIdentifierCase } from '../src/identifier.ts';

const convert = (text: string, style: Parameters<typeof toIdentifierCase>[1], locale?: string) =>
  toIdentifierCase(text, style, { locale });

test('every style from plain words', () => {
  const text = 'user account id';
  assert.equal(convert(text, 'camel'), 'userAccountId');
  assert.equal(convert(text, 'pascal'), 'UserAccountId');
  assert.equal(convert(text, 'snake'), 'user_account_id');
  assert.equal(convert(text, 'constant'), 'USER_ACCOUNT_ID');
  assert.equal(convert(text, 'kebab'), 'user-account-id');
  assert.equal(convert(text, 'dot'), 'user.account.id');
  assert.equal(convert(text, 'slug'), 'user-account-id');
});

test('identifiers convert into each other', () => {
  assert.equal(convert('userAccountId', 'snake'), 'user_account_id');
  assert.equal(convert('user_account_id', 'pascal'), 'UserAccountId');
  assert.equal(convert('USER_ACCOUNT_ID', 'camel'), 'userAccountId');
  assert.equal(convert('user-account-id', 'constant'), 'USER_ACCOUNT_ID');
  assert.equal(convert('User.Account.Id', 'kebab'), 'user-account-id');
});

test('acronyms and digits split where a reader would split them', () => {
  assert.deepEqual(splitWords('XMLHttpRequest'), ['XML', 'Http', 'Request']);
  assert.deepEqual(splitWords('parseHTML5Doc'), ['parse', 'HTML5', 'Doc']);
  assert.deepEqual(splitWords('version2 h1Title'), ['version2', 'h1', 'Title']);
  assert.equal(convert('XMLHttpRequest', 'snake'), 'xml_http_request');
});

test('apostrophes do not split a word', () => {
  assert.equal(convert("don't stop me now", 'camel'), 'dontStopMeNow');
  assert.equal(convert('Rock ’n’ roll', 'kebab'), 'rock-n-roll');
});

test('punctuation separates words and is dropped', () => {
  assert.equal(convert('Q3 report: sales (draft)!', 'snake'), 'q3_report_sales_draft');
});

test('each line converts on its own and keeps its markdown prefix', () => {
  const text = '- First item\n- [ ] second item\n## A heading here\n> quoted text';
  assert.equal(
    convert(text, 'kebab'),
    '- first-item\n- [ ] second-item\n## a-heading-here\n> quoted-text',
  );
});

test('blank lines and lines without words are kept', () => {
  assert.equal(convert('one two\n\n---\nthree four', 'snake'), 'one_two\n\n---\nthree_four');
  assert.equal(convert('', 'camel'), '');
  assert.equal(convert('   ', 'camel'), '   ');
});

test('code, maths, links and URLs stay where they are', () => {
  assert.equal(
    convert('make it `the code` then [[Some Note]] more fun', 'snake'),
    'make_it `the code` then [[Some Note]] more_fun',
  );
  assert.equal(convert('go to https://Example.com/A_B please', 'kebab'), 'go-to https://Example.com/A_B please');
  assert.equal(convert('the [Link Text](https://x.io) here', 'camel'), 'the [Link Text](https://x.io) here');
  assert.equal(convert('big energy $E = mc^2$ always', 'constant'), 'BIG_ENERGY $E = mc^2$ ALWAYS');
});

test('fenced code blocks are skipped', () => {
  const text = 'make this snake\n```\nkeep This\n```\nand this too';
  assert.equal(convert(text, 'snake'), 'make_this_snake\n```\nkeep This\n```\nand_this_too');
});

test('slugs drop accents but keep letters with no Latin base', () => {
  assert.equal(convert('Café Über Straße', 'slug'), 'cafe-uber-strasse');
  assert.equal(convert('Łódź, Ærø & Þórr', 'slug'), 'lodz-aero-thorr');
  assert.equal(convert('Привет мир', 'slug'), 'привет-мир');
  assert.equal(convert('Café crème', 'kebab'), 'café-crème');
  assert.equal(stripAccents('naïve résumé'), 'naive resume');
});

test('the locale decides the dotted and dotless i', () => {
  assert.equal(convert('istanbul ili', 'constant', 'tr'), 'İSTANBUL_İLİ');
  assert.equal(convert('istanbul ili', 'constant'), 'ISTANBUL_ILI');
});

test('a heading becomes a slug in one step', () => {
  assert.equal(convert('# Getting Started — Quick Guide (2026)', 'slug'), '# getting-started-quick-guide-2026');
});
