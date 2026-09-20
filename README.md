# Text Case and Cleanup

Change the case of the text you have selected, and clean up prose that came
out of a PDF, a scan or a web page.

Everything runs on the text in front of you. There is no network access, no
telemetry and no paste hook: a command only ever touches the selection you
give it, and each one is a single undo step.

## Commands

Each command works on every selection you have. With no selection it works on
the current line, and on a blank line it does nothing.

### Case

| Command | `the lord of the rings` becomes |
| --- | --- |
| Uppercase | `THE LORD OF THE RINGS` |
| Lowercase | `the lord of the rings` |
| Title case | `The Lord of the Rings` |
| Sentence case | `The lord of the rings` |
| Capitalize each word | `The Lord Of The Rings` |
| Capitalize sentences, leaving the rest | `The lord of the rings` |
| Cycle case | lowercase, then Title Case, then UPPERCASE, then round again |

**Sentence case** lowers everything first and then raises the opening word of
each sentence. **Capitalize sentences** only raises the opening word, so proper
nouns you already typed survive.

### Cleanup

| Command | What it does |
| --- | --- |
| Join wrapped lines | Merges a hard-wrapped paragraph back into one line, rejoining any word split across the break |
| Rejoin words split across lines | Undoes the hyphenation without touching the line breaks |
| Remove invisible characters | Strips soft hyphens, zero-width marks and byte order marks, and turns non-breaking and exotic spaces into ordinary ones |
| Links to plain text | Replaces every link with the text it displays |

## What these commands will not touch

- **Fenced code blocks and inline code** are copied through untouched, as is
  inline maths.
- **URLs, wikilinks, autolinks and e-mail addresses** keep their case, because
  lowering a URL can break it.
- **A line's markdown prefix** — quote markers, bullets, ordered numbers, task
  checkboxes, heading hashes — is never rewritten. `- [x] buy milk` becomes
  `- [x] Buy milk`, never `- [X] Buy Milk`.
- **Abbreviations and decimals** (`e.g.`, `U.S.A.`, `3.14`) do not end a
  sentence and keep their own capitals.

## Settings

| Setting | Default | What it is for |
| --- | --- | --- |
| Language rules | System default | Turkish and Azerbaijani map the dotted and dotless i differently from every other language; Lithuanian keeps the dot over an accented lowercase i |
| Keep acronyms as they are | On | Leaves `NASA` and `PDF` alone. It is ignored when the whole selection is already uppercase, since then every word looks like an acronym |
| Words title case keeps lowercase | A practical list | No two style guides agree here, so the list is yours to edit. The first and last word of a title are always capitalized whatever the list says |
| Drop the hyphen when joining lines | On | A PDF breaks a word as `trans-` and `lation`. Turn this off for text where a real compound such as `well-known` is likelier than a broken word |
| Keep image alt text | On | Leaves the description behind when an image becomes plain text |

## Scope

This is a rebuild of the uncontested half of
[Text Format](https://github.com/Benature/obsidian-text-format), whose last
release was in July 2024. It deliberately leaves out:

- **Whitespace trimming and format-on-paste.** Several maintained plugins
  already do this, and rewriting the clipboard as it lands is a different and
  riskier product than a command you invoke.
- **The original's grab bag** — callouts, Anki, LaTeX conversion, table to
  list, heading level shifting, API requests. Those are separate tools wearing
  one name.

## Bugs it does not reproduce

These are open issues on the original. They are fixed here by design, and each
one has a test naming it.

| Issue | Symptom there |
| --- | --- |
| [#33](https://github.com/Benature/obsidian-text-format/issues/33) | `don't` became `Don'T`, because the apostrophe started a new word |
| [#103](https://github.com/Benature/obsidian-text-format/issues/103) | Removing a wikilink failed when it contained a `#` |
| [#110](https://github.com/Benature/obsidian-text-format/issues/110) | Uppercasing an empty line froze the app |
| [#112](https://github.com/Benature/obsidian-text-format/issues/112) | Capitalizing a sentence rewrote the `[x]` of a task |
| [#114](https://github.com/Benature/obsidian-text-format/issues/114) | Title case mangled Vietnamese |
| [#115](https://github.com/Benature/obsidian-text-format/issues/115) | Removing a link left fragments when it held brackets or parentheses |
| [#118](https://github.com/Benature/obsidian-text-format/issues/118) | Turkish `i` did not become `İ` |
| [#120](https://github.com/Benature/obsidian-text-format/issues/120) | No way to unwrap a hard-wrapped paragraph |
| [#121](https://github.com/Benature/obsidian-text-format/issues/121) | Title case lowered the first word when it was on the ignore list |

## Installing

Once the plugin is in the community directory: Settings -> Community plugins ->
Browse, search for it, then install and enable it.

To install it by hand before then, download `main.js`, `manifest.json` and
`styles.css` from the [latest release][releases] into
`<your vault>/.obsidian/plugins/text-format/` and enable the plugin in
Settings -> Community plugins.

[releases]: https://github.com/perezamadorluisenrique-gif/text-format/releases

It needs Obsidian 1.0.0 or newer.

## Building and testing

```
npm install
npm test     # the logic, under plain Node
npm run build
```

The logic lives in `src/case.ts` and `src/cleanup.ts` and imports nothing from
Obsidian, so it runs and is tested under plain Node. `main.ts` is the only file
that talks to the editor, and it edits by range inside one
`editor.transaction`, so a command is one undo step and never replaces the
document.

## Licence

MIT, (c) Siulved54.
