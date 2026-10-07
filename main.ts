import {
  type Editor,
  type EditorChange,
  type EditorPosition,
  type EditorSelection,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
  SuggestModal,
} from 'obsidian';

import {
  type CaseOptions,
  DEFAULT_STOP_WORDS,
  capitalizeSentences,
  capitalizeWords,
  cycleCase,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from './src/case.ts';

import { type IdentifierStyle, toIdentifierCase } from './src/identifier.ts';

import {
  joinWrappedLines,
  linksToPlainText,
  removeInvisibles,
  removeLineHyphenation,
  replaceLigatures,
  straightenPunctuation,
} from './src/cleanup.ts';

import { collapseBlankLines, removeBlankLines, removeDuplicateLines, sortLines } from './src/lines.ts';

import { frontmatterLineCount } from './src/segments.ts';

import {
  TIDY_STEPS,
  TIDY_STEP_LABELS,
  type TidyResult,
  type TidyStep,
  collapseMultipleSpaces,
  endsInsideCode,
  removeTrailingWhitespace,
  tidy,
  wordRangeAt,
} from './src/tidy.ts';

interface TextFormatSettings {
  /** A BCP 47 tag, or '' for the rules of the running system. */
  locale: string;
  preserveAcronyms: boolean;
  /** Comma separated, so the settings field stays a single line. */
  stopWords: string;
  removeHyphenOnJoin: boolean;
  keepImageAltText: boolean;
  /** With no selection, a case command changes the whole line or just the word at the caret. */
  caseTarget: 'line' | 'word';
  tidyInvisibles: boolean;
  tidyLigatures: boolean;
  tidyJoin: boolean;
  tidySpaces: boolean;
  tidyTrailing: boolean;
  tidyBlank: boolean;
  /** Keep two trailing spaces before a line break (a Markdown `<br>`). */
  keepHardBreaks: boolean;
  confirmTidy: boolean;
  cleanOnPaste: boolean;
}

/** The setting behind each Tidy step. */
const TIDY_KEYS: Record<TidyStep, keyof TextFormatSettings> = {
  invisibles: 'tidyInvisibles',
  ligatures: 'tidyLigatures',
  join: 'tidyJoin',
  spaces: 'tidySpaces',
  trailing: 'tidyTrailing',
  blank: 'tidyBlank',
};

const DEFAULT_SETTINGS: TextFormatSettings = {
  locale: '',
  preserveAcronyms: true,
  stopWords: DEFAULT_STOP_WORDS.join(', '),
  removeHyphenOnJoin: true,
  keepImageAltText: true,
  caseTarget: 'line',
  tidyInvisibles: true,
  tidyLigatures: true,
  tidyJoin: false,
  tidySpaces: true,
  tidyTrailing: true,
  tidyBlank: true,
  keepHardBreaks: true,
  confirmTidy: true,
  cleanOnPaste: false,
};

function chosenSteps(settings: TextFormatSettings): TidyStep[] {
  return TIDY_STEPS.filter((step) => settings[TIDY_KEYS[step]] === true);
}

/**
 * Languages whose case rules differ from the default mapping. Turkish and
 * Azerbaijani have the dotted and dotless i, Lithuanian keeps the dot over a
 * lowercase i under an accent.
 */
const LOCALES: Record<string, string> = {
  '': 'System default',
  tr: 'Turkish',
  az: 'Azerbaijani',
  lt: 'Lithuanian',
};

interface Command {
  id: string;
  name: string;
  /** Shown when the command is put on the mobile toolbar. */
  icon: string;
  run: (text: string, settings: TextFormatSettings) => string;
  /** Offered in the case picker. */
  isCase?: boolean;
  /**
   * Works on whole lines: the selection grows to the lines it touches, and
   * with no selection the command takes the whole note.
   */
  lines?: boolean;
  /** Changes letter case: with no selection it follows the "line or word" setting. */
  casing?: boolean;
}

function identifier(id: string, name: string, icon: string, style: IdentifierStyle): Command {
  return {
    id,
    name,
    icon,
    isCase: true,
    casing: true,
    run: (t, s) => toIdentifierCase(t, style, { locale: caseOptions(s).locale }),
  };
}

function caseOptions(settings: TextFormatSettings): CaseOptions {
  return {
    locale: settings.locale === '' ? undefined : settings.locale,
    preserveAcronyms: settings.preserveAcronyms,
    stopWords: settings.stopWords
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word.length > 0),
  };
}

const COMMANDS: Command[] = [
  { id: 'upper', icon: 'case-upper', name: 'Uppercase', isCase: true, casing: true, run: (t, s) => toUpperCase(t, caseOptions(s)) },
  { id: 'lower', icon: 'case-lower', name: 'Lowercase', isCase: true, casing: true, run: (t, s) => toLowerCase(t, caseOptions(s)) },
  { id: 'title', icon: 'heading', name: 'Title case', isCase: true, casing: true, run: (t, s) => toTitleCase(t, caseOptions(s)) },
  { id: 'sentence', icon: 'case-sensitive', name: 'Sentence case', isCase: true, casing: true, run: (t, s) => toSentenceCase(t, caseOptions(s)) },
  {
    id: 'capitalize-words',
    name: 'Capitalize each word',
    icon: 'whole-word',
    isCase: true,
    casing: true,
    run: (t, s) => capitalizeWords(t, caseOptions(s)),
  },
  {
    id: 'capitalize-sentences',
    name: 'Capitalize sentences, leaving the rest',
    icon: 'pilcrow',
    isCase: true,
    casing: true,
    run: (t, s) => capitalizeSentences(t, caseOptions(s)),
  },
  { id: 'cycle', icon: 'repeat', name: 'Cycle case', casing: true, run: (t, s) => cycleCase(t, caseOptions(s)) },
  identifier('camel-case', 'camelCase', 'code', 'camel'),
  identifier('pascal-case', 'PascalCase', 'braces', 'pascal'),
  identifier('snake-case', 'snake_case', 'underline', 'snake'),
  identifier('constant-case', 'CONSTANT_CASE', 'arrow-big-up', 'constant'),
  identifier('kebab-case', 'kebab-case', 'minus', 'kebab'),
  identifier('dot-case', 'dot.case', 'dot', 'dot'),
  identifier('train-case', 'Train-Case', 'train-front', 'train'),
  identifier('pascal-snake-case', 'Pascal_Snake_Case', 'baseline', 'pascal-snake'),
  identifier('path-case', 'path/case', 'slash', 'path'),
  identifier('capital-case', 'Capital Case', 'type', 'capital'),
  identifier('no-case', 'no case', 'text', 'no'),
  identifier('slug', 'Slug (lowercase, no accents, hyphens)', 'link', 'slug'),
  {
    id: 'join-lines',
    name: 'Join wrapped lines',
    icon: 'merge',
    run: (t, s) => joinWrappedLines(t, { removeHyphen: s.removeHyphenOnJoin }),
  },
  {
    id: 'dehyphenate',
    name: 'Rejoin words split across lines',
    icon: 'spell-check',
    run: (t) => removeLineHyphenation(t),
  },
  {
    id: 'strip-invisibles',
    name: 'Remove invisible characters',
    icon: 'eraser',
    run: (t) => removeInvisibles(t),
  },
  {
    id: 'replace-ligatures',
    name: 'Replace ligatures',
    icon: 'case-lower',
    run: (t) => replaceLigatures(t),
  },
  {
    id: 'straighten-punctuation',
    name: 'Straighten quotes and dashes',
    icon: 'remove-formatting',
    run: (t) => straightenPunctuation(t),
  },
  { id: 'remove-trailing-whitespace', name: 'Remove trailing whitespace', icon: 'space', lines: true,
    run: (t, s) => removeTrailingWhitespace(t, { keepHardBreaks: s.keepHardBreaks }) },
  { id: 'collapse-spaces', name: 'Collapse multiple spaces', icon: 'chevrons-left-right', lines: true,
    run: (t) => collapseMultipleSpaces(t) },
  {
    id: 'unlink',
    name: 'Links to plain text',
    icon: 'unlink',
    run: (t, s) => linksToPlainText(t, { keepImageAltText: s.keepImageAltText }),
  },
  {
    id: 'sort-lines',
    name: 'Sort lines A to Z',
    icon: 'arrow-down-az',
    lines: true,
    run: (t, s) => sortLines(t, 'asc', s.locale === '' ? undefined : s.locale),
  },
  {
    id: 'sort-lines-desc',
    name: 'Sort lines Z to A',
    icon: 'arrow-up-za',
    lines: true,
    run: (t, s) => sortLines(t, 'desc', s.locale === '' ? undefined : s.locale),
  },
  { id: 'dedupe-lines', name: 'Remove duplicate lines', icon: 'copy-minus', lines: true, run: (t) => removeDuplicateLines(t) },
  { id: 'remove-blank-lines', name: 'Remove blank lines', icon: 'fold-vertical', lines: true, run: (t) => removeBlankLines(t) },
  {
    id: 'collapse-blank-lines',
    name: 'Remove extra blank lines (keep one)',
    icon: 'between-horizontal-start',
    lines: true,
    run: (t) => collapseBlankLines(t),
  },
];

/** True when `a` comes before `b` in the document. */
function isBefore(a: EditorPosition, b: EditorPosition): boolean {
  return a.line !== b.line ? a.line < b.line : a.ch < b.ch;
}

/**
 * The text a command works on: the selection, or the whole current line when
 * there is no selection.
 *
 * A caret on a blank line yields nothing, which is why this plugin cannot
 * reproduce upstream #110, where uppercasing an empty line froze the app.
 */
function rangeFor(editor: Editor, selection: EditorSelection, lines = false, word = false): [EditorPosition, EditorPosition] | null {
  const { anchor, head } = selection;

  if (lines) {
    const empty = anchor.line === head.line && anchor.ch === head.ch;
    if (empty) {
      const last = editor.lastLine();
      return [{ line: 0, ch: 0 }, { line: last, ch: editor.getLine(last).length }];
    }
    const [from, to] = isBefore(anchor, head) ? [anchor, head] : [head, anchor];
    // A selection ending at the start of a line does not take that line.
    const lastLine = to.ch === 0 && to.line > from.line ? to.line - 1 : to.line;
    return [{ line: from.line, ch: 0 }, { line: lastLine, ch: editor.getLine(lastLine).length }];
  }

  if (anchor.line !== head.line || anchor.ch !== head.ch) {
    return isBefore(anchor, head) ? [anchor, head] : [head, anchor];
  }

  const line = editor.getLine(anchor.line);
  if (line.trim().length === 0) return null;

  if (word) {
    const span = wordRangeAt(line, anchor.ch);
    return span === null ? null : [{ line: anchor.line, ch: span[0] }, { line: anchor.line, ch: span[1] }];
  }

  return [{ line: anchor.line, ch: 0 }, { line: anchor.line, ch: line.length }];
}

export default class TextFormatPlugin extends Plugin {
  settings: TextFormatSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();

    for (const command of COMMANDS) {
      this.addCommand({
        id: command.id,
        name: command.name,
        icon: command.icon,
        editorCallback: (editor: Editor) => this.apply(editor, command),
      });
    }

    this.addCommand({
      id: 'tidy-note',
      name: 'Tidy note',
      icon: 'sparkles',
      editorCallback: (editor: Editor) => this.tidyNote(editor),
    });

    this.registerEvent(this.app.workspace.on('editor-paste', (evt, editor) => this.cleanPaste(evt, editor)));

    // One hotkey for every case, with each result previewed on the
    // selection before it is applied.
    this.addCommand({
      id: 'pick-case',
      name: 'Change case…',
      icon: 'a-large-small',
      editorCallback: (editor: Editor) => {
        new CasePicker(this, editor, COMMANDS.filter((command) => command.isCase)).open();
      },
    });

    this.addSettingTab(new TextFormatSettingTab(this));
  }

  /**
   * Rewrites every selection in one editor transaction.
   *
   * One transaction is one undo step, and every change is a range edit, so
   * the document is never replaced wholesale. Replacing it would throw away
   * the undo history, the folds and the scroll position — the mistake this
   * repository already made once in `snap-markers`.
   */
  apply(editor: Editor, command: Command): void {
    const changes = this.plan(editor, command);

    if (changes.length === 0) {
      new Notice('Nothing to format.');
      return;
    }

    // No `selections` is deliberate: the editor maps the existing ones
    // through the changes, which is what keeps a multi-cursor edit sane.
    editor.transaction({ changes });
  }

  /**
   * Tidy note: the steps chosen in settings, over the selection or the whole
   * note. What each step would change is shown first, and the edit is one
   * transaction, so one undo reverts all of it.
   */
  tidyNote(editor: Editor): void {
    const totals = new Map<TidyStep, number>();
    const command: Command = {
      id: 'tidy-note',
      name: 'Tidy note',
      icon: 'sparkles',
      lines: true,
      run: (text, settings) => {
        const result = tidy(text, this.tidyOptions(settings));
        for (const { step, count } of result.report) totals.set(step, (totals.get(step) ?? 0) + count);
        return result.text;
      },
    };

    if (chosenSteps(this.settings).length === 0) {
      new Notice('No tidy steps are turned on. Choose some in the settings.');
      return;
    }

    const changes = this.plan(editor, command);
    if (changes.length === 0) {
      new Notice('Nothing to tidy.');
      return;
    }

    const report = TIDY_STEPS
      .filter((step) => totals.has(step))
      .map((step) => ({ step, count: totals.get(step) ?? 0 }));
    const apply = (): void => editor.transaction({ changes });

    if (this.settings.confirmTidy) new TidyModal(this, report, apply).open();
    else apply();
  }

  private tidyOptions(settings: TextFormatSettings) {
    return {
      steps: chosenSteps(settings),
      keepHardBreaks: settings.keepHardBreaks,
      removeHyphen: settings.removeHyphenOnJoin,
    };
  }

  /**
   * Clean on paste, off unless turned on. Only a plain-text paste: anything
   * with HTML or files is left to Obsidian, which converts it itself, and
   * so is anything another handler already took. The clipboard is read, never
   * written, and nothing happens inside code or frontmatter.
   */
  cleanPaste(evt: ClipboardEvent, editor: Editor): void {
    if (!this.settings.cleanOnPaste || evt.defaultPrevented) return;

    const data = evt.clipboardData;
    if (data === null || data.files.length > 0 || data.types.includes('text/html')) return;

    const pasted = data.getData('text/plain');
    if (pasted === '') return;

    const lineCount = editor.lineCount();
    const bodyStart = frontmatterLineCount((i) => (i < lineCount ? editor.getLine(i) : undefined));

    for (const { anchor, head } of editor.listSelections()) {
      const start = isBefore(anchor, head) ? anchor : head;
      if (start.line < bodyStart || endsInsideCode(editor.getRange({ line: 0, ch: 0 }, start))) return;
    }

    const result = tidy(pasted, this.tidyOptions(this.settings));
    if (result.text === pasted) return;

    evt.preventDefault();
    editor.replaceSelection(result.text);
  }

  /** The edits a command would make, without making them. */
  plan(editor: Editor, command: Command): EditorChange[] {
    const changes: EditorChange[] = [];
    const seen = new Set<string>();

    // Frontmatter is data, not prose: a selection that reaches into it,
    // Select all being the usual one, is trimmed to start below it.
    const lineCount = editor.lineCount();
    const bodyStart = frontmatterLineCount((i) => (i < lineCount ? editor.getLine(i) : undefined));

    for (const selection of editor.listSelections()) {
      const range = rangeFor(editor, selection, command.lines, command.casing === true && this.settings.caseTarget === 'word');
      if (range === null) continue;

      const [start, to] = range;
      let from = start;
      if (from.line < bodyStart) {
        if (to.line < bodyStart) continue;
        from = { line: bodyStart, ch: 0 };
        if (!isBefore(from, to)) continue;
      }
      const key = `${from.line}:${from.ch}-${to.line}:${to.ch}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const original = editor.getRange(from, to);
      const formatted = command.run(original, this.settings);

      // Writing text identical to what is there would still cost an undo
      // step, so a command that changes nothing does nothing.
      if (formatted === original) continue;

      changes.push({ from, to, text: formatted });
    }

    return changes;
  }

  async loadSettings(): Promise<void> {
    // `loadData()` is typed `any`, and whatever is on disk was written by
    // some earlier version of this plugin, so it is read as `unknown` and
    // narrowed before it is merged over the defaults.
    const stored = (await this.loadData()) as Partial<TextFormatSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

/** Confirms a tidy: what each step would change, then Tidy or Cancel. */
class TidyModal extends Modal {
  private report: TidyResult['report'];
  private onConfirm: () => void;

  constructor(plugin: TextFormatPlugin, report: TidyResult['report'], onConfirm: () => void) {
    super(plugin.app);
    this.report = report;
    this.onConfirm = onConfirm;
  }

  onOpen(): void {
    const { contentEl } = this;
    this.setTitle('Tidy note');

    const list = contentEl.createEl('ul');
    for (const { step, count } of this.report) {
      list.createEl('li', { text: `${TIDY_STEP_LABELS[step]}: ${count} ${count === 1 ? 'line' : 'lines'}` });
    }

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText('Tidy')
        .setCta()
        .onClick(() => {
          this.close();
          this.onConfirm();
        }))
      .addButton((button) => button.setButtonText('Cancel').onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** How much of the converted selection a picker row shows. */
const PREVIEW_LENGTH = 60;

/**
 * Every case command in one list, each row showing what the first selection
 * would become, so choosing between snake_case and kebab-case needs no
 * trial and undo.
 */
class CasePicker extends SuggestModal<Command> {
  private plugin: TextFormatPlugin;
  private editor: Editor;
  private commands: Command[];

  constructor(plugin: TextFormatPlugin, editor: Editor, commands: Command[]) {
    super(plugin.app);
    this.plugin = plugin;
    this.editor = editor;
    this.commands = commands;
    this.setPlaceholder('Pick a case for the selection');
  }

  getSuggestions(query: string): Command[] {
    const wanted = query.toLowerCase().replace(/[\s_.-]+/g, '');
    return this.commands.filter((command) =>
      command.name.toLowerCase().replace(/[\s_.-]+/g, '').includes(wanted));
  }

  renderSuggestion(command: Command, el: HTMLElement): void {
    el.createDiv({ text: command.name });
    el.createEl('small', { text: this.preview(command), cls: 'text-format-preview' });
  }

  onChooseSuggestion(command: Command): void {
    this.plugin.apply(this.editor, command);
  }

  private preview(command: Command): string {
    const change = this.plugin.plan(this.editor, command)[0];
    if (change === undefined) return 'No change';

    const text = change.text.split('\n').find((line) => line.trim().length > 0) ?? change.text;
    const chars = Array.from(text.trim());
    return chars.length > PREVIEW_LENGTH ? chars.slice(0, PREVIEW_LENGTH).join('') + '…' : chars.join('');
  }
}

/**
 * Each setting's name and description, written once. The declarative
 * definitions below and the `display()` fallback both read from here, so the
 * two renderings cannot drift apart.
 */
const SETTING_TEXT: Record<keyof TextFormatSettings, { name: string; desc: string }> = {
  locale: {
    name: 'Language rules',
    desc: 'Turkish and Azerbaijani map the dotted and dotless i differently from every other language.',
  },
  preserveAcronyms: {
    name: 'Keep acronyms as they are',
    desc: 'Leaves acronyms like NASA and PDF, and names like iPhone, macOS and GitHub, as they are. Ignored when the whole selection is already uppercase, since then every word looks like an acronym.',
  },
  stopWords: {
    name: 'Words title case keeps lowercase',
    desc: 'Comma separated. The first and last word of a title are always capitalized, whatever this list says.',
  },
  removeHyphenOnJoin: {
    name: 'Drop the hyphen when joining lines',
    desc: 'A PDF breaks a word as "trans-" and "lation". Turn this off for text where a real compound such as "well-known" is likelier than a broken word.',
  },
  caseTarget: {
    name: 'With no selection, change case of',
    desc: 'The whole line, or only the word at the caret.',
  },
  tidyInvisibles: { name: 'Remove invisible characters', desc: 'Zero-width characters and soft hyphens go; non-breaking spaces become spaces.' },
  tidyLigatures: { name: 'Replace ligatures', desc: 'ﬁ and ﬂ become fi and fl.' },
  tidyJoin: { name: 'Join wrapped lines', desc: 'Merges a paragraph hard-wrapped across lines. Off by default: it changes the line structure.' },
  tidySpaces: { name: 'Collapse multiple spaces', desc: 'Runs of spaces between words become one. Indentation, tables and code are left alone.' },
  tidyTrailing: { name: 'Remove trailing whitespace', desc: 'Spaces and tabs at the end of lines.' },
  tidyBlank: { name: 'Remove extra blank lines', desc: 'Runs of blank lines become one.' },
  keepHardBreaks: {
    name: 'Keep hard line breaks',
    desc: 'Two trailing spaces before a line of text are a line break in Markdown, so trailing whitespace removal keeps them. Turn this off to strip them too.',
  },
  confirmTidy: { name: 'Confirm before tidying', desc: 'Shows how many lines each step would change before applying.' },
  cleanOnPaste: {
    name: 'Tidy on paste',
    desc: 'Runs the steps above on plain text you paste. Never inside code or frontmatter, and pastes that carry formatting are left to Obsidian. Off by default.',
  },
  keepImageAltText: {
    name: 'Keep image alt text',
    desc: 'Leaves the description behind when an image is turned into plain text, rather than removing the image entirely.',
  },
};

/** The Tidy settings that are plain on/off switches, in the order shown. */
const TIDY_TOGGLES = [
  'tidyInvisibles', 'tidyLigatures', 'tidyJoin', 'tidySpaces', 'tidyTrailing', 'tidyBlank',
  'keepHardBreaks', 'confirmTidy', 'cleanOnPaste',
] as const;

class TextFormatSettingTab extends PluginSettingTab {
  private plugin: TextFormatPlugin;

  constructor(plugin: TextFormatPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  /**
   * The settings, described rather than drawn.
   *
   * Obsidian 1.13 and later renders this itself and, the reason for writing
   * it, indexes it so the settings turn up in the settings search. Older
   * versions know nothing about this method and fall back to `display()`.
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group',
        heading: 'Case',
        items: [
          {
            ...SETTING_TEXT.locale,
            control: {
              type: 'dropdown',
              key: 'locale',
              options: LOCALES,
              defaultValue: DEFAULT_SETTINGS.locale,
            },
          },
          {
            ...SETTING_TEXT.preserveAcronyms,
            control: {
              type: 'toggle',
              key: 'preserveAcronyms',
              defaultValue: DEFAULT_SETTINGS.preserveAcronyms,
            },
          },
          {
            ...SETTING_TEXT.caseTarget,
            control: {
              type: 'dropdown',
              key: 'caseTarget',
              options: { line: 'Whole line', word: 'Word at the caret' },
              defaultValue: DEFAULT_SETTINGS.caseTarget,
            },
          },
          {
            ...SETTING_TEXT.stopWords,
            control: {
              type: 'textarea',
              key: 'stopWords',
              placeholder: DEFAULT_STOP_WORDS.join(', '),
              // The list is a sentence's worth of text, not one word.
              rows: 4,
              defaultValue: DEFAULT_SETTINGS.stopWords,
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Cleanup',
        items: [
          {
            ...SETTING_TEXT.removeHyphenOnJoin,
            control: {
              type: 'toggle',
              key: 'removeHyphenOnJoin',
              defaultValue: DEFAULT_SETTINGS.removeHyphenOnJoin,
            },
          },
          {
            ...SETTING_TEXT.keepImageAltText,
            control: {
              type: 'toggle',
              key: 'keepImageAltText',
              defaultValue: DEFAULT_SETTINGS.keepImageAltText,
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Tidy note',
        items: TIDY_TOGGLES.map((key) => ({
          ...SETTING_TEXT[key],
          control: { type: 'toggle', key, defaultValue: DEFAULT_SETTINGS[key] },
        })),
      },
    ];
  }

  /**
   * Persists a change made through a declarative control.
   *
   * The inherited version writes to `plugin.settings` too, but routing it
   * through `saveSettings()` keeps one path to disk for both renderings.
   */
  async setControlValue(key: string, value: unknown): Promise<void> {
    Object.assign(this.plugin.settings, { [key]: value });
    await this.plugin.saveSettings();
  }

  /**
   * The pre-1.13 rendering. Obsidian skips this entirely once
   * `getSettingDefinitions()` returns anything, so it is dead code on a
   * current app and only runs for users below the 1.13 line.
   */
  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings;
    containerEl.empty();

    new Setting(containerEl).setName('Case').setHeading();

    new Setting(containerEl)
      .setName(SETTING_TEXT.locale.name)
      .setDesc(SETTING_TEXT.locale.desc)
      .addDropdown((dropdown) => {
        for (const [value, label] of Object.entries(LOCALES)) dropdown.addOption(value, label);

        dropdown.setValue(settings.locale).onChange(async (value) => {
          settings.locale = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(SETTING_TEXT.preserveAcronyms.name)
      .setDesc(SETTING_TEXT.preserveAcronyms.desc)
      .addToggle((toggle) => toggle
        .setValue(settings.preserveAcronyms)
        .onChange(async (value) => {
          settings.preserveAcronyms = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(SETTING_TEXT.caseTarget.name)
      .setDesc(SETTING_TEXT.caseTarget.desc)
      .addDropdown((dropdown) => dropdown
        .addOption('line', 'Whole line')
        .addOption('word', 'Word at the caret')
        .setValue(settings.caseTarget)
        .onChange(async (value) => {
          settings.caseTarget = value === 'word' ? 'word' : 'line';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(SETTING_TEXT.stopWords.name)
      .setDesc(SETTING_TEXT.stopWords.desc)
      .addTextArea((text) => {
        text.inputEl.addClass('text-format-stop-words');

        text
          .setPlaceholder(DEFAULT_STOP_WORDS.join(', '))
          .setValue(settings.stopWords)
          .onChange(async (value) => {
            settings.stopWords = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl).setName('Cleanup').setHeading();

    new Setting(containerEl)
      .setName(SETTING_TEXT.removeHyphenOnJoin.name)
      .setDesc(SETTING_TEXT.removeHyphenOnJoin.desc)
      .addToggle((toggle) => toggle
        .setValue(settings.removeHyphenOnJoin)
        .onChange(async (value) => {
          settings.removeHyphenOnJoin = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(SETTING_TEXT.keepImageAltText.name)
      .setDesc(SETTING_TEXT.keepImageAltText.desc)
      .addToggle((toggle) => toggle
        .setValue(settings.keepImageAltText)
        .onChange(async (value) => {
          settings.keepImageAltText = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl).setName('Tidy note').setHeading();

    for (const key of TIDY_TOGGLES) {
      new Setting(containerEl)
        .setName(SETTING_TEXT[key].name)
        .setDesc(SETTING_TEXT[key].desc)
        .addToggle((toggle) => toggle
          .setValue(settings[key])
          .onChange(async (value) => {
            settings[key] = value;
            await this.plugin.saveSettings();
          }));
    }
  }
}
