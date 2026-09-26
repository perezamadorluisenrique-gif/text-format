import assert from 'node:assert/strict';
import test from 'node:test';

import {
  capitalizeSentences,
  capitalizeWords,
  cycleCase,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from '../src/case.ts';

test('toUpperCase and toLowerCase are plain conversions', () => {
  assert.equal(toUpperCase('hola Mundo'), 'HOLA MUNDO');
  assert.equal(toLowerCase('HOLA Mundo'), 'hola mundo');
});

test('an empty selection is returned unchanged', () => {
  // Upstream #110: uppercasing an empty line froze the app.
  for (const value of ['', '   ', '\n\n']) {
    assert.equal(toUpperCase(value), value);
    assert.equal(toSentenceCase(value), value);
    assert.equal(toTitleCase(value), value);
  }
});

test('case commands leave a URL alone', () => {
  const text = 'read https://Example.com/Path now';

  assert.equal(toUpperCase(text), 'READ https://Example.com/Path NOW');
  assert.equal(toLowerCase('READ https://Example.com/Path NOW'), text);
});

test('case commands leave inline code and math alone', () => {
  assert.equal(toUpperCase('run `npm test` now'), 'RUN `npm test` NOW');
  assert.equal(toLowerCase('SEE $E = mc^2$ HERE'), 'see $E = mc^2$ here');
});

test('case commands leave fenced code alone', () => {
  const text = 'before\n```\nconst x = 1;\n```\nafter';

  assert.equal(toUpperCase(text), 'BEFORE\n```\nconst x = 1;\n```\nAFTER');
});

test('apostrophes stay inside their word', () => {
  // Upstream #33: this produced `Don'T Stop`.
  assert.equal(capitalizeWords("don't stop"), "Don't Stop");
  assert.equal(capitalizeWords('it’s here'), 'It’s Here');
});

test('acronyms survive title case and capitalisation', () => {
  assert.equal(toTitleCase('the NASA report'), 'The NASA Report');
  assert.equal(capitalizeWords('a PDF file'), 'A PDF File');
});

test('acronym preservation can be turned off', () => {
  assert.equal(
    toTitleCase('the NASA report', { preserveAcronyms: false }),
    'The Nasa Report',
  );
});

test('title case keeps stop words lower in the middle', () => {
  assert.equal(toTitleCase('the lord of the rings'), 'The Lord of the Rings');
});

test('title case always capitalises the first and last word', () => {
  // Upstream #121: a title opening or closing on an ignored word lost it.
  assert.equal(toTitleCase('the end of the'), 'The End of The');
  assert.equal(toTitleCase('a walk in'), 'A Walk In');
});

test('title case capitalises both halves of a hyphenated compound', () => {
  assert.equal(toTitleCase('a well-known state-of-the-art tool'),
    'A Well-Known State-of-the-Art Tool');
});

test('title case treats each line as its own title', () => {
  assert.equal(toTitleCase('the first\nthe second'), 'The First\nThe Second');
});

test('sentence case lowers the rest and raises each sentence', () => {
  assert.equal(
    toSentenceCase('THIS IS ONE. AND THIS IS TWO!'),
    'This is one. And this is two!',
  );
});

test('sentence case does not break on an abbreviation or a decimal', () => {
  assert.equal(
    toSentenceCase('it costs 3.50 e.g. today. fine.'),
    'It costs 3.50 e.g. today. Fine.',
  );
});

test('capitalizeSentences leaves proper nouns as typed', () => {
  assert.equal(
    capitalizeSentences('madrid is warm. lisbon is warmer.'),
    'Madrid is warm. Lisbon is warmer.',
  );
  assert.equal(
    capitalizeSentences('the Ebro runs east. the Tagus does not.'),
    'The Ebro runs east. The Tagus does not.',
  );
});

test('a task checkbox is not mistaken for the first word', () => {
  // Upstream #112: `- [x] task` came back as `- [X] Task`.
  assert.equal(capitalizeSentences('- [x] buy milk'), '- [x] Buy milk');
  assert.equal(toSentenceCase('- [X] BUY MILK'), '- [X] Buy milk');
  assert.equal(toUpperCase('- [x] buy milk'), '- [x] BUY MILK');
});

test('list, quote and heading markers survive', () => {
  assert.equal(capitalizeSentences('1. first\n2. second'), '1. First\n2. Second');
  assert.equal(capitalizeSentences('> quoted line'), '> Quoted line');
  assert.equal(capitalizeSentences('## a heading'), '## A heading');
});

test('a sentence wrapped over two lines is not re-capitalised', () => {
  assert.equal(
    capitalizeSentences('this is one sentence\nsplit over two lines.'),
    'This is one sentence\nsplit over two lines.',
  );
});

test('each list item starts a new sentence', () => {
  assert.equal(
    capitalizeSentences('- one thing\n- another thing'),
    '- One thing\n- Another thing',
  );
});

test('Turkish case rules are applied when the locale asks for them', () => {
  // Upstream #118: the dotted and dotless i.
  assert.equal(toUpperCase('istanbul', { locale: 'tr' }), 'İSTANBUL');
  assert.equal(toLowerCase('ISTANBUL', { locale: 'tr' }), 'ıstanbul');
  assert.equal(toUpperCase('istanbul'), 'ISTANBUL');
});

test('Vietnamese diacritics survive title case', () => {
  // Upstream #114.
  assert.equal(toTitleCase('tiếng việt'), 'Tiếng Việt');
  assert.equal(toUpperCase('tiếng việt'), 'TIẾNG VIỆT');
});

test('cycleCase walks lower, title, upper and back', () => {
  assert.equal(cycleCase('hola mundo'), 'Hola Mundo');
  assert.equal(cycleCase('Hola Mundo'), 'HOLA MUNDO');
  assert.equal(cycleCase('HOLA MUNDO'), 'hola mundo');
});

test('cycleCase leaves nothing stuck', () => {
  let text = 'NASA';
  const seen = new Set<string>();

  for (let i = 0; i < 4; i += 1) {
    text = cycleCase(text);
    seen.add(text);
  }

  assert.equal(seen.size, 3);
});

test('a custom stop word list replaces the default', () => {
  assert.equal(
    toTitleCase('the lord of the rings', { stopWords: ['of'] }),
    'The Lord of The Rings',
  );
});

test('case commands leave display maths alone', () => {
  const text = 'the sum\n$$\n\\Sigma_{i} = \\Alpha\n$$\nis big';

  assert.equal(toUpperCase(text), 'THE SUM\n$$\n\\Sigma_{i} = \\Alpha\n$$\nIS BIG');
  assert.equal(toLowerCase(text), 'the sum\n$$\n\\Sigma_{i} = \\Alpha\n$$\nis big');
});

test('a code block quoting another fence stays code to its real end', () => {
  const text = '````\n```\nconst x = 1;\n```\n````\nafter';

  assert.equal(toUpperCase(text), '````\n```\nconst x = 1;\n```\n````\nAFTER');
});

test('a fence of the other character does not close a code block', () => {
  const text = '~~~\nlet a;\n```\nlet b;\n~~~\nafter';

  assert.equal(toUpperCase(text), '~~~\nlet a;\n```\nlet b;\n~~~\nAFTER');
});

test('file names and domains keep their case', () => {
  assert.equal(toTitleCase('edit main.ts and notes.md'), 'Edit main.ts and notes.md');
  assert.equal(toTitleCase('read the docs on obsidian.md today'), 'Read the Docs on obsidian.md Today');
  assert.equal(toUpperCase('open main.ts now'), 'OPEN main.ts NOW');
  // A full stop with no space after it, before a real word, still splits.
  assert.equal(toTitleCase('the end.next part'), 'The End.Next Part');
});

test('mixed-case names survive title, word and sentence case', () => {
  assert.equal(toTitleCase('a well-known iPhone app on GitHub'), 'A Well-Known iPhone App on GitHub');
  assert.equal(toTitleCase('using macOS and iOS with JavaScript'), 'Using macOS and iOS with JavaScript');
  assert.equal(capitalizeWords('ask McDonald about eBay'), 'Ask McDonald About eBay');
  assert.equal(toSentenceCase('the iPhone is here. we use GitHub'), 'The iPhone is here. We use GitHub');
});

test('mixed-case names flatten when preservation is off, and in the cycle', () => {
  assert.equal(toTitleCase('the iPhone', { preserveAcronyms: false }), 'The Iphone');
  assert.equal(cycleCase('the iPhone'), 'the iphone');
});
