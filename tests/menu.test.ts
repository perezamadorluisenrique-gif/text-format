import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  CASE_MENU,
  CLEANUP_MENU,
  SEPARATOR,
  canUseSubmenus,
  editorMenuModel,
  tidySeparators,
} from '../src/menu.ts';

const main = fs.readFileSync(new URL('../main.ts', import.meta.url), 'utf8');

test('the menu is off when the setting is off', () => {
  assert.equal(editorMenuModel({ enabled: false, hasSelection: true, submenus: true }), null);
});

test('desktop with a selection: two submenus, most used first', () => {
  const model = editorMenuModel({ enabled: true, hasSelection: true, submenus: true });
  assert.equal(model?.mode, 'submenu');
  assert.deepEqual(model?.groups.map((g) => g.id), ['case', 'cleanup']);
  assert.deepEqual(model?.groups[0].entries, ['upper', 'lower', 'title', 'sentence', 'capitalize-words', 'slug', SEPARATOR, 'pick-case']);
  assert.deepEqual(model?.groups[1].entries, [
    'tidy-note', 'join-lines', 'strip-invisibles', 'straighten-punctuation', 'unlink', SEPARATOR,
    'sort-lines', 'dedupe-lines', 'collapse-blank-lines',
  ]);
});

test('without a selection, joining lines is left out (one line has nothing to join)', () => {
  const model = editorMenuModel({ enabled: true, hasSelection: false, submenus: true });
  assert.equal(model?.groups[1].entries.includes('join-lines'), false);
  assert.equal(model?.groups[1].entries[0], 'tidy-note');
  assert.deepEqual(model?.groups[0].entries, CASE_MENU);
});

test('the menu stays short', () => {
  for (const list of [CASE_MENU, CLEANUP_MENU]) {
    assert.ok(list.filter((e) => e !== SEPARATOR).length <= 8);
  }
});

test('picker mode (mobile): no separators and no "Change case…" inside the case list', () => {
  const model = editorMenuModel({ enabled: true, hasSelection: true, submenus: false });
  assert.equal(model?.mode, 'picker');
  for (const group of model?.groups ?? []) {
    assert.equal(group.entries.includes(SEPARATOR), false);
    assert.equal(group.entries.includes('pick-case'), false);
  }
  assert.equal(model?.groups[1].entries.length, 8);
});

test('separators never lead, trail or repeat', () => {
  assert.deepEqual(tidySeparators([SEPARATOR, 'a', SEPARATOR, SEPARATOR, 'b', SEPARATOR]), ['a', SEPARATOR, 'b']);
  assert.deepEqual(tidySeparators([SEPARATOR, SEPARATOR]), []);
  assert.deepEqual(tidySeparators([]), []);
});

test('submenus only on desktop and only when the menu item has setSubmenu', () => {
  const item = { setSubmenu: () => ({}) };
  assert.equal(canUseSubmenus(false, item), true);
  assert.equal(canUseSubmenus(true, item), false);
  assert.equal(canUseSubmenus(false, {}), false);
  assert.equal(canUseSubmenus(false, null), false);
  assert.equal(canUseSubmenus(false, { setSubmenu: true }), false);
});

test('every menu entry is a registered command, Tidy note or the case picker', () => {
  const ids = new Set([...main.matchAll(/(?:id: |identifier\()'([a-z-]+)'/g)].map((m) => m[1]));
  for (const entry of [...CASE_MENU, ...CLEANUP_MENU]) {
    if (entry === SEPARATOR) continue;
    assert.ok(ids.has(entry), `${entry} is not a command id in main.ts`);
  }
});
