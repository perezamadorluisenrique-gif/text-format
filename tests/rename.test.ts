import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { toLowerCase, toSentenceCase, toTitleCase } from '../src/case.ts';
import { toIdentifierCase } from '../src/identifier.ts';
import { MAX_NAME_BYTES, NAMING_CASES, nameProblem, planRename, splitPath } from '../src/rename.ts';

const kebab = (s: string): string => toIdentifierCase(s, 'kebab');
const slug = (s: string): string => toIdentifierCase(s, 'slug');
const snake = (s: string): string => toIdentifierCase(s, 'snake');

test('splitPath keeps the folder and the extension apart from the name', () => {
  assert.deepEqual(splitPath('Projects/2026/My note.md'), { folder: 'Projects/2026/', basename: 'My note', extension: '.md' });
  assert.deepEqual(splitPath('note.md'), { folder: '', basename: 'note', extension: '.md' });
  assert.deepEqual(splitPath('v1.2 release.md'), { folder: '', basename: 'v1.2 release', extension: '.md' });
  assert.deepEqual(splitPath('README'), { folder: '', basename: 'README', extension: '' });
  assert.deepEqual(splitPath('a/.hidden'), { folder: 'a/', basename: '.hidden', extension: '' });
});

test('only the base name changes, never the folder or the extension', () => {
  const plan = planRename('Work Notes/meeting notes ABC.md', (s) => toTitleCase(s), []);
  assert.deepEqual(plan, { ok: true, path: 'Work Notes/Meeting Notes ABC.md', name: 'Meeting Notes ABC.md' });
  assert.deepEqual(planRename('My Great Idea.md', kebab, []), { ok: true, path: 'my-great-idea.md', name: 'my-great-idea.md' });
  assert.deepEqual(planRename('Café con Leche.png', slug, []), { ok: true, path: 'cafe-con-leche.png', name: 'cafe-con-leche.png' });
  assert.deepEqual(planRename('Daily Log.md', snake, []), { ok: true, path: 'daily_log.md', name: 'daily_log.md' });
  assert.deepEqual(planRename('THE BIG PLAN.md', (s) => toSentenceCase(s, { preserveAcronyms: false }), []),
    { ok: true, path: 'The big plan.md', name: 'The big plan.md' });
});

test('a name already in the case is reported, not renamed', () => {
  assert.deepEqual(planRename('my-note.md', kebab, ['my-note.md']), { ok: false, reason: 'unchanged', name: 'my-note.md' });
});

test('a name another file already has is refused, ignoring case', () => {
  const existing = ['Notes/My Note.md', 'Notes/my-note.md', 'Other/Plan.md', 'Notes/PLAN.md'];
  assert.deepEqual(planRename('Notes/My Note.md', kebab, existing), { ok: false, reason: 'taken', name: 'my-note.md' });
  assert.deepEqual(planRename('Notes/plan.md', (s) => toTitleCase(s), [...existing, 'Notes/plan.md']),
    { ok: false, reason: 'taken', name: 'Plan.md' });
  // The same name in another folder is fine.
  assert.equal(planRename('Other/my note.md', kebab, existing).ok, true);
});

test('changing only the case of a name is allowed (the file itself does not collide)', () => {
  assert.deepEqual(planRename('my note.md', (s) => toTitleCase(s), ['my note.md']), { ok: true, path: 'My Note.md', name: 'My Note.md' });
  assert.deepEqual(planRename('MY NOTE.md', (s) => toLowerCase(s, { preserveAcronyms: false }), ['MY NOTE.md']),
    { ok: true, path: 'my note.md', name: 'my note.md' });
});

test('names Windows or Android cannot store are refused', () => {
  const plan = planRename('a.md', () => 'what: now?', []);
  assert.equal(plan.ok, false);
  assert.deepEqual(!plan.ok && plan.reason === 'invalid' ? plan.problem : null, { kind: 'forbidden', chars: ': ?' });
  assert.deepEqual(nameProblem('a/b'), { kind: 'forbidden', chars: '/' });
  assert.deepEqual(nameProblem('a\\b<c>|"*'), { kind: 'forbidden', chars: '\\ < > | " *' });
  assert.deepEqual(nameProblem('con'), { kind: 'reserved' });
  assert.deepEqual(nameProblem('LPT1'), { kind: 'reserved' });
  assert.deepEqual(nameProblem('Nul.backup'), { kind: 'reserved' });
  assert.equal(nameProblem('console'), null);
  assert.deepEqual(nameProblem('end.'), { kind: 'trailing' });
  assert.deepEqual(nameProblem('end '), { kind: 'trailing' });
  assert.deepEqual(nameProblem('.hidden'), { kind: 'leadingDot' });
  assert.deepEqual(nameProblem('   '), { kind: 'empty' });
  assert.deepEqual(nameProblem('tab\there'), { kind: 'control' });
  assert.deepEqual(nameProblem('é'.repeat(130), '.md'), { kind: 'tooLong' });
  assert.equal(nameProblem('a'.repeat(MAX_NAME_BYTES - 3), '.md'), null);
  assert.equal(nameProblem('2026-11-18 Meeting #3 [draft]'), null);
});

test('a conversion that empties the name is refused, and a line break in it becomes a space', () => {
  const plan = planRename('note.md', () => '  ', []);
  assert.equal(plan.ok, false);
  assert.equal(!plan.ok && plan.reason === 'invalid' && plan.problem.kind, 'empty');
  assert.deepEqual(planRename('a.md', () => 'two\nlines', []), { ok: true, path: 'two lines.md', name: 'two lines.md' });
});

test('every naming case is a registered command', () => {
  const main = fs.readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
  for (const id of NAMING_CASES) assert.ok(main.includes(`'${id}'`), id);
});
