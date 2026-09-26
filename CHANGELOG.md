# Changelog

The release workflow uses the section named after the version being released
as the release description, so every version needs one. `npm version <x.y.z>`
renames the `Unreleased` heading below to that version.

## 0.2.1

- Every command has an icon, so the ones you add to the mobile toolbar
  (Settings → Mobile → Manage toolbar options) show what they do instead of
  a question mark. **Change case…** is the one to add if you want a single
  button for every case.

## 0.2.0

- Seven new cases for names rather than prose: camelCase, PascalCase,
  snake_case, CONSTANT_CASE, kebab-case, dot.case, and Slug (lowercase, no
  accents, hyphens). They convert into each other too, so `userAccountId`
  becomes `user_account_id` and back. `XMLHttpRequest` splits as
  `xml_http_request`, and `don't` stays one word.
- Each line converts on its own and keeps its bullet, task box, quote marker
  or heading hashes, so a list of titles becomes a list of slugs rather than
  one long identifier. Inline code, maths, links and URLs stay as they are.
- Slug drops accents (`Café Über Straße` becomes `cafe-uber-strasse`) but
  keeps Cyrillic, Greek, CJK and other scripts with no Latin form.
- New command **Change case…** opens one list of every case, each showing what
  your selection would become. Bind it to one hotkey instead of fourteen.

## 0.1.2

- File names and domains keep their case: Title case made `Main.Ts` of
  `main.ts` and `Obsidian.Md` of `obsidian.md`. A title that ends in a file
  name, a URL or inline code no longer capitalises the stop word before it.

- No command touches a note's frontmatter any more. With the whole note
  selected, Title case capitalised property names (`tags` became `Tags`, which
  Obsidian no longer reads as tags), Join wrapped lines merged every property
  onto one line, and Links to plain text stripped links out of properties. A
  selection that reaches into the frontmatter now starts below it.
- `$$` display maths is left alone, like inline maths already was. Case
  commands recased the LaTeX inside it (`\Sigma` became `\sigma`) and Join
  wrapped lines merged it into the surrounding paragraph.
- A code block fenced with four backticks that quotes a three-backtick fence,
  or a `~~~` block that contains a ```` ``` ```` line, now stays code to its
  real end. The inner fence used to switch the commands back on halfway
  through the block.

## 0.1.1

- Settings are now described with Obsidian 1.13's declarative settings API, so
  they turn up when you search the settings window. The settings themselves,
  and what they do, are unchanged.
- Replaced the `builtin-modules` build dependency with Node's own
  `module.builtinModules`. The plugin itself is unaffected.
- Tidied three regular expressions: redundant escapes in the checkbox pattern,
  and the invisible characters in the cleanup command written as escapes
  rather than as themselves. All three match exactly what they matched before.
- Added linting to the build, and release assets now carry a GitHub build
  provenance attestation.

## 0.1.0

First release.

Eleven commands for the selection, or the current line when nothing is
selected.

Case: uppercase, lowercase, title case, sentence case, capitalize each word,
capitalize sentences leaving the rest alone, and cycle between them. Turkish,
Azerbaijani and Lithuanian casing rules are available, acronyms can be left
alone, and the words title case keeps lowercase are editable.

Cleanup: join wrapped lines, rejoin words split across a line break,
remove invisible characters, and turn links into plain text.

Every command runs as a single undo step and rewrites only the ranges it
changes, so folds, the scroll position and multiple cursors survive.
