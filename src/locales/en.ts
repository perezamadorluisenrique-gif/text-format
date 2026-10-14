// The source of the message keys and the fallback language. Every other file in
// this folder must have exactly these keys and the same {placeholders}; the
// build fails on a missing or extra key and `tests/i18n.test.ts` checks the rest.
// Not here, and never translated: the names of naming schemes (camelCase,
// snake_case…), the setting keys in data.json and the text the commands write.
const en = {
  // Commands
  'command.upper': 'Uppercase',
  'command.lower': 'Lowercase',
  'command.title': 'Title case',
  'command.sentence': 'Sentence case',
  'command.capitalizeWords': 'Capitalize each word',
  'command.capitalizeSentences': 'Capitalize sentences, leaving the rest',
  'command.cycle': 'Cycle case',
  'command.slug': 'Slug (lowercase, no accents, hyphens)',
  'command.joinLines': 'Join wrapped lines',
  'command.dehyphenate': 'Rejoin words split across lines',
  'command.stripInvisibles': 'Remove invisible characters',
  'command.replaceLigatures': 'Replace ligatures',
  'command.straightenPunctuation': 'Straighten quotes and dashes',
  'command.removeTrailingWhitespace': 'Remove trailing whitespace',
  'command.collapseSpaces': 'Collapse multiple spaces',
  'command.unlink': 'Links to plain text',
  'command.sortLines': 'Sort lines A to Z',
  'command.sortLinesDesc': 'Sort lines Z to A',
  'command.dedupeLines': 'Remove duplicate lines',
  'command.removeBlankLines': 'Remove blank lines',
  'command.collapseBlankLines': 'Remove extra blank lines (keep one)',
  'command.tidyNote': 'Tidy note',
  'command.pickCase': 'Change case…',
  'command.runSavedReplacement': 'Run a saved replacement…',
  'command.replace': 'Replace: {name}',

  // Notices
  'notice.nothingToFormat': 'Nothing to format.',
  'notice.nothingToTidy': 'Nothing to tidy.',
  'notice.noTidySteps': 'No tidy steps are turned on. Choose some in the settings.',
  'notice.noSavedReplacements': 'No saved replacements yet. Add some in the plugin settings.',
  'notice.replacementProblem': 'Replace: {name}: {problem}',
  'notice.unnamed': 'Unnamed',
  'notice.skippedInCode': 'The selection starts or ends inside code, so it was left alone.',
  'notice.noMatches': 'No matches for "{name}".',
  'notice.replacements.one': 'Made 1 replacement.',
  'notice.replacements.other': 'Made {count} replacements.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Pick a case for the selection',
  'modal.noChange': 'No change',
  'modal.pickReplacement': 'Pick a saved replacement to run',
  'modal.noName': '(Unnamed)',
  'modal.tidy.line.one': '{step}: 1 line',
  'modal.tidy.line.other': '{step}: {count} lines',
  'modal.tidy.confirm': 'Tidy',
  'modal.tidy.cancel': 'Cancel',

  // The steps of Tidy note
  'tidy.invisibles': 'Remove invisible characters',
  'tidy.ligatures': 'Replace ligatures',
  'tidy.join': 'Join wrapped lines',
  'tidy.spaces': 'Collapse multiple spaces',
  'tidy.trailing': 'Remove trailing whitespace',
  'tidy.blank': 'Remove extra blank lines',

  // Why a saved replacement cannot run
  'error.findEmpty': 'Find text is empty.',
  'error.invalidRegex': 'Not a valid regular expression: {reason}',

  // Settings: headings
  'heading.case': 'Case',
  'heading.cleanup': 'Cleanup',
  'heading.tidy': 'Tidy note',
  'heading.replacements': 'Saved replacements',

  // Settings: dropdown options
  'option.systemDefault': 'System default',
  'option.turkish': 'Turkish',
  'option.azerbaijani': 'Azerbaijani',
  'option.lithuanian': 'Lithuanian',
  'option.wholeLine': 'Whole line',
  'option.wordAtCaret': 'Word at the caret',

  // Settings
  'setting.locale.name': 'Language rules',
  'setting.locale.desc': 'Turkish and Azerbaijani map the dotted and dotless i differently from every other language.',
  'setting.preserveAcronyms.name': 'Keep acronyms as they are',
  'setting.preserveAcronyms.desc':
    'Leaves acronyms like NASA and PDF, and names like iPhone, macOS and GitHub, as they are. Ignored when the whole selection is already uppercase, since then every word looks like an acronym.',
  'setting.stopWords.name': 'Words title case keeps lowercase',
  'setting.stopWords.desc': 'Comma separated. The first and last word of a title are always capitalized, whatever this list says.',
  'setting.removeHyphenOnJoin.name': 'Drop the hyphen when joining lines',
  'setting.removeHyphenOnJoin.desc':
    'A PDF breaks a word as "trans-" and "lation". Turn this off for text where a real compound such as "well-known" is likelier than a broken word.',
  'setting.caseTarget.name': 'With no selection, change case of',
  'setting.caseTarget.desc': 'The whole line, or only the word at the caret.',
  'setting.tidyInvisibles.name': 'Remove invisible characters',
  'setting.tidyInvisibles.desc': 'Zero-width characters and soft hyphens go; non-breaking spaces become spaces.',
  'setting.tidyLigatures.name': 'Replace ligatures',
  'setting.tidyLigatures.desc': 'ﬁ and ﬂ become fi and fl.',
  'setting.tidyJoin.name': 'Join wrapped lines',
  'setting.tidyJoin.desc': 'Merges a paragraph hard-wrapped across lines. Off by default: it changes the line structure.',
  'setting.tidySpaces.name': 'Collapse multiple spaces',
  'setting.tidySpaces.desc': 'Runs of spaces between words become one. Indentation, tables and code are left alone.',
  'setting.tidyTrailing.name': 'Remove trailing whitespace',
  'setting.tidyTrailing.desc': 'Spaces and tabs at the end of lines.',
  'setting.tidyBlank.name': 'Remove extra blank lines',
  'setting.tidyBlank.desc': 'Runs of blank lines become one.',
  'setting.keepHardBreaks.name': 'Keep hard line breaks',
  'setting.keepHardBreaks.desc':
    'Two trailing spaces before a line of text are a line break in Markdown, so trailing whitespace removal keeps them. Turn this off to strip them too.',
  'setting.confirmTidy.name': 'Confirm before tidying',
  'setting.confirmTidy.desc': 'Shows how many lines each step would change before applying.',
  'setting.cleanOnPaste.name': 'Tidy on paste',
  'setting.cleanOnPaste.desc':
    'Runs the steps above on plain text you paste. Never inside code or frontmatter, and pastes that carry formatting are left to Obsidian. Off by default.',
  'setting.keepImageAltText.name': 'Keep image alt text',
  'setting.keepImageAltText.desc':
    'Leaves the description behind when an image is turned into plain text, rather than removing the image entirely.',

  // Settings: saved replacements
  'replacements.name': 'Your find-and-replace commands',
  'replacements.desc':
    'Each replacement becomes a command, "Replace: <name>", that you can give a hotkey, and is listed in "Run a saved replacement…". It works on the selection, or on the whole note when nothing is selected, and never touches code or front matter.',
  'replacements.nameField': 'Name',
  'replacements.nameDesc': 'The command is called "Replace: <name>". Without a name there is no command.',
  'replacements.namePlaceholder': 'Fix dashes',
  'replacements.delete': 'Delete this replacement',
  'replacements.find': 'Find',
  'replacements.replaceWith': 'Replace with',
  'replacements.replaceWithDesc': 'Leave empty to delete the matches. With regular expression on, $1 is the first group and \\n a line break.',
  'replacements.regex': 'Regular expression',
  'replacements.matchCase': 'Match case',
  'replacements.add': 'Add a replacement',
} as const;

export default en;
