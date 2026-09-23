import {
  type Editor,
  type EditorChange,
  type EditorPosition,
  type EditorSelection,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
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

import {
  joinWrappedLines,
  linksToPlainText,
  removeInvisibles,
  removeLineHyphenation,
} from './src/cleanup.ts';

import { frontmatterLineCount } from './src/segments.ts';

interface TextFormatSettings {
  /** A BCP 47 tag, or '' for the rules of the running system. */
  locale: string;
  preserveAcronyms: boolean;
  /** Comma separated, so the settings field stays a single line. */
  stopWords: string;
  removeHyphenOnJoin: boolean;
  keepImageAltText: boolean;
}

const DEFAULT_SETTINGS: TextFormatSettings = {
  locale: '',
  preserveAcronyms: true,
  stopWords: DEFAULT_STOP_WORDS.join(', '),
  removeHyphenOnJoin: true,
  keepImageAltText: true,
};

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
  run: (text: string, settings: TextFormatSettings) => string;
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
  { id: 'upper', name: 'Uppercase', run: (t, s) => toUpperCase(t, caseOptions(s)) },
  { id: 'lower', name: 'Lowercase', run: (t, s) => toLowerCase(t, caseOptions(s)) },
  { id: 'title', name: 'Title case', run: (t, s) => toTitleCase(t, caseOptions(s)) },
  { id: 'sentence', name: 'Sentence case', run: (t, s) => toSentenceCase(t, caseOptions(s)) },
  {
    id: 'capitalize-words',
    name: 'Capitalize each word',
    run: (t, s) => capitalizeWords(t, caseOptions(s)),
  },
  {
    id: 'capitalize-sentences',
    name: 'Capitalize sentences, leaving the rest',
    run: (t, s) => capitalizeSentences(t, caseOptions(s)),
  },
  { id: 'cycle', name: 'Cycle case', run: (t, s) => cycleCase(t, caseOptions(s)) },
  {
    id: 'join-lines',
    name: 'Join wrapped lines',
    run: (t, s) => joinWrappedLines(t, { removeHyphen: s.removeHyphenOnJoin }),
  },
  {
    id: 'dehyphenate',
    name: 'Rejoin words split across lines',
    run: (t) => removeLineHyphenation(t),
  },
  {
    id: 'strip-invisibles',
    name: 'Remove invisible characters',
    run: (t) => removeInvisibles(t),
  },
  {
    id: 'unlink',
    name: 'Links to plain text',
    run: (t, s) => linksToPlainText(t, { keepImageAltText: s.keepImageAltText }),
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
function rangeFor(editor: Editor, selection: EditorSelection): [EditorPosition, EditorPosition] | null {
  const { anchor, head } = selection;

  if (anchor.line !== head.line || anchor.ch !== head.ch) {
    return isBefore(anchor, head) ? [anchor, head] : [head, anchor];
  }

  const line = editor.getLine(anchor.line);
  if (line.trim().length === 0) return null;

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
        editorCallback: (editor: Editor) => this.apply(editor, command),
      });
    }

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
  private apply(editor: Editor, command: Command): void {
    const changes: EditorChange[] = [];
    const seen = new Set<string>();

    // Frontmatter is data, not prose: a selection that reaches into it,
    // Select all being the usual one, is trimmed to start below it.
    const lineCount = editor.lineCount();
    const bodyStart = frontmatterLineCount((i) => (i < lineCount ? editor.getLine(i) : undefined));

    for (const selection of editor.listSelections()) {
      const range = rangeFor(editor, selection);
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

    if (changes.length === 0) {
      new Notice('Nothing to format.');
      return;
    }

    // No `selections` is deliberate: the editor maps the existing ones
    // through the changes, which is what keeps a multi-cursor edit sane.
    editor.transaction({ changes });
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
    desc: 'Leaves runs like NASA and PDF alone. Ignored when the whole selection is already uppercase, since then every word looks like an acronym.',
  },
  stopWords: {
    name: 'Words title case keeps lowercase',
    desc: 'Comma separated. The first and last word of a title are always capitalized, whatever this list says.',
  },
  removeHyphenOnJoin: {
    name: 'Drop the hyphen when joining lines',
    desc: 'A PDF breaks a word as "trans-" and "lation". Turn this off for text where a real compound such as "well-known" is likelier than a broken word.',
  },
  keepImageAltText: {
    name: 'Keep image alt text',
    desc: 'Leaves the description behind when an image is turned into plain text, rather than removing the image entirely.',
  },
};

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
  }
}
