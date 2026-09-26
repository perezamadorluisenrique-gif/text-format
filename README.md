# Text Case and Cleanup

[![Latest release](https://img.shields.io/github/v/release/perezamadorluisenrique-gif/text-format?sort=semver)](https://github.com/perezamadorluisenrique-gif/text-format/releases/latest)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22text-format%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=text-format)
[![CI](https://github.com/perezamadorluisenrique-gif/text-format/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/perezamadorluisenrique-gif/text-format/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/perezamadorluisenrique-gif/text-format)](LICENSE)

Change the case of the text you have selected, and clean up prose that came
out of a PDF, a scan or a web page.

Everything runs on the text in front of you. There is no network access, no
telemetry and no paste hook: a command only ever touches the selection you
give it, and each one is a single undo step.

![Selecting a note and running Title case from the command palette](https://raw.githubusercontent.com/perezamadorluisenrique-gif/text-format/main/docs/title-case.gif)

## Installing

In Obsidian, open Settings -> Community plugins -> Browse, search for
Text Case and Cleanup, then install and enable it.

To install it by hand instead:

1. Download `main.js`, `manifest.json` and `styles.css` from the
   [latest release](https://github.com/perezamadorluisenrique-gif/text-format/releases/latest).
2. Put the three files in `<your vault>/.obsidian/plugins/text-format/`.
3. Reload Obsidian and turn the plugin on under Settings -> Community plugins.

It needs Obsidian 1.0.0 or newer, and works on desktop and mobile alike.

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

### Names: variables, file names, tags, anchors

| Command | `user account ID` becomes |
| --- | --- |
| camelCase | `userAccountId` |
| PascalCase | `UserAccountId` |
| snake_case | `user_account_id` |
| CONSTANT_CASE | `USER_ACCOUNT_ID` |
| kebab-case | `user-account-id` |
| dot.case | `user.account.id` |
| Slug (lowercase, no accents, hyphens) | `user-account-id`, and `Café Über Straße` becomes `cafe-uber-strasse` |

They read each other as well as prose: `userAccountId`, `user_account_id` and
`USER-ACCOUNT-ID` all give the same words, `XMLHttpRequest` splits as
`xml_http_request`, and `don't` stays one word. Each line converts on its own
and keeps its bullet, task box or heading hashes, so a list of titles becomes a
list of slugs, not one long identifier. Links, URLs, inline code and maths are
left in place.

### One hotkey for all of them

**Change case…** lists every case with a preview of what your selection would
become. Type a few letters to filter (`snake`, `kebab`), then Enter.

![The Change case picker, previewing each case on the selected heading](https://raw.githubusercontent.com/perezamadorluisenrique-gif/text-format/main/docs/case-picker.png)

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

![A hard-wrapped, hyphenated paragraph pasted from a PDF, joined into one line with Join wrapped lines](https://raw.githubusercontent.com/perezamadorluisenrique-gif/text-format/main/docs/join-lines.gif)

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

![Before and after Title case: the heading marks, task boxes, URL, quote marker and inline code are unchanged](https://raw.githubusercontent.com/perezamadorluisenrique-gif/text-format/main/docs/title-case-before-after.png)

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

## More plugins by Siulved54

| Plugin | What it does | Source |
| --- | --- | --- |
| [Shared Blocks](https://obsidian.md/plugins?id=shared-blocks) | Write a block of text once and reuse it in any note. Edit the source and every reference re-renders live. | [shared-blocks](https://github.com/perezamadorluisenrique-gif/shared-blocks) |
| [Typography as You Type](https://obsidian.md/plugins?id=typography-as-you-type) | Curly quotes, dashes and ellipses as you type, kept out of code and maths, with Backspace to take one back. | [smart-typography-plugin](https://github.com/perezamadorluisenrique-gif/smart-typography-plugin) |

Both are in the community directory: Settings -> Community plugins -> Browse,
then search for the name.

## Licence

MIT, see [LICENSE](LICENSE).
