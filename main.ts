import {
  type Editor,
  type EditorChange,
  type EditorPosition,
  type EditorSelection,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
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

    for (const selection of editor.listSelections()) {
      const range = rangeFor(editor, selection);
      if (range === null) continue;

      const [from, to] = range;
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class TextFormatSettingTab extends PluginSettingTab {
  private plugin: TextFormatPlugin;

  constructor(plugin: TextFormatPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings;
    containerEl.empty();

    new Setting(containerEl).setName('Case').setHeading();

    new Setting(containerEl)
      .setName('Language rules')
      .setDesc('Turkish and Azerbaijani map the dotted and dotless i differently from every other language.')
      .addDropdown((dropdown) => {
        for (const [value, label] of Object.entries(LOCALES)) dropdown.addOption(value, label);

        dropdown.setValue(settings.locale).onChange(async (value) => {
          settings.locale = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Keep acronyms as they are')
      .setDesc('Leaves runs like NASA and PDF alone. Ignored when the whole selection is already uppercase, since then every word looks like an acronym.')
      .addToggle((toggle) => toggle
        .setValue(settings.preserveAcronyms)
        .onChange(async (value) => {
          settings.preserveAcronyms = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Words title case keeps lowercase')
      .setDesc('Comma separated. The first and last word of a title are always capitalized, whatever this list says.')
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
      .setName('Drop the hyphen when joining lines')
      .setDesc('A PDF breaks a word as "trans-" and "lation". Turn this off for text where a real compound such as "well-known" is likelier than a broken word.')
      .addToggle((toggle) => toggle
        .setValue(settings.removeHyphenOnJoin)
        .onChange(async (value) => {
          settings.removeHyphenOnJoin = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Keep image alt text')
      .setDesc('Leaves the description behind when an image is turned into plain text, rather than removing the image entirely.')
      .addToggle((toggle) => toggle
        .setValue(settings.keepImageAltText)
        .onChange(async (value) => {
          settings.keepImageAltText = value;
          await this.plugin.saveSettings();
        }));
  }
}
