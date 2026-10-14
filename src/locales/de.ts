import type { Messages } from '../i18n.ts';

const de: Messages = {
  // Commands
  'command.upper': 'Großbuchstaben',
  'command.lower': 'Kleinbuchstaben',
  'command.title': 'Titel-Schreibweise',
  'command.sentence': 'Satz-Schreibweise',
  'command.capitalizeWords': 'Jedes Wort großschreiben',
  'command.capitalizeSentences': 'Sätze großschreiben, Rest unverändert lassen',
  'command.cycle': 'Schreibweise durchschalten',
  'command.slug': 'Slug (Kleinbuchstaben, ohne Akzente, mit Bindestrichen)',
  'command.joinLines': 'Umbrochene Zeilen verbinden',
  'command.dehyphenate': 'Über Zeilen getrennte Wörter wieder verbinden',
  'command.stripInvisibles': 'Unsichtbare Zeichen entfernen',
  'command.replaceLigatures': 'Ligaturen ersetzen',
  'command.straightenPunctuation': 'Anführungszeichen und Striche begradigen',
  'command.removeTrailingWhitespace': 'Leerzeichen am Zeilenende entfernen',
  'command.collapseSpaces': 'Mehrfache Leerzeichen zusammenfassen',
  'command.unlink': 'Links in einfachen Text umwandeln',
  'command.sortLines': 'Zeilen von A bis Z sortieren',
  'command.sortLinesDesc': 'Zeilen von Z bis A sortieren',
  'command.dedupeLines': 'Doppelte Zeilen entfernen',
  'command.removeBlankLines': 'Leerzeilen entfernen',
  'command.collapseBlankLines': 'Überzählige Leerzeilen entfernen (eine bleibt)',
  'command.tidyNote': 'Notiz aufräumen',
  'command.pickCase': 'Groß-/Kleinschreibung ändern…',
  'command.runSavedReplacement': 'Gespeicherte Ersetzung ausführen…',
  'command.replace': 'Ersetzen: {name}',

  // Notices
  'notice.nothingToFormat': 'Nichts zu formatieren.',
  'notice.nothingToTidy': 'Nichts aufzuräumen.',
  'notice.noTidySteps': 'Es sind keine Aufräumschritte eingeschaltet. Wähle in den Einstellungen welche aus.',
  'notice.noSavedReplacements': 'Noch keine gespeicherten Ersetzungen. Füge welche in den Einstellungen der Erweiterung hinzu.',
  'notice.replacementProblem': 'Ersetzen: {name}: {problem}',
  'notice.unnamed': 'ohne Namen',
  'notice.skippedInCode': 'Die Auswahl beginnt oder endet in Code und blieb deshalb unverändert.',
  'notice.noMatches': 'Keine Treffer für „{name}“.',
  'notice.replacements.one': '1 Ersetzung vorgenommen.',
  'notice.replacements.other': '{count} Ersetzungen vorgenommen.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Schreibweise für die Auswahl wählen',
  'modal.noChange': 'Keine Änderung',
  'modal.pickReplacement': 'Gespeicherte Ersetzung zum Ausführen wählen',
  'modal.noName': '(ohne Namen)',
  'modal.tidy.line.one': '{step}: 1 Zeile',
  'modal.tidy.line.other': '{step}: {count} Zeilen',
  'modal.tidy.confirm': 'Aufräumen',
  'modal.tidy.cancel': 'Abbrechen',

  // The steps of Tidy note
  'tidy.invisibles': 'Unsichtbare Zeichen entfernen',
  'tidy.ligatures': 'Ligaturen ersetzen',
  'tidy.join': 'Umbrochene Zeilen verbinden',
  'tidy.spaces': 'Mehrfache Leerzeichen zusammenfassen',
  'tidy.trailing': 'Leerzeichen am Zeilenende entfernen',
  'tidy.blank': 'Überzählige Leerzeilen entfernen',

  // Why a saved replacement cannot run
  'error.findEmpty': 'Der Suchtext ist leer.',
  'error.invalidRegex': 'Kein gültiger regulärer Ausdruck: {reason}',

  // Settings: headings
  'heading.case': 'Groß-/Kleinschreibung',
  'heading.cleanup': 'Bereinigung',
  'heading.tidy': 'Notiz aufräumen',
  'heading.replacements': 'Gespeicherte Ersetzungen',

  // Settings: dropdown options
  'option.systemDefault': 'Systemstandard',
  'option.turkish': 'Türkisch',
  'option.azerbaijani': 'Aserbaidschanisch',
  'option.lithuanian': 'Litauisch',
  'option.wholeLine': 'Ganze Zeile',
  'option.wordAtCaret': 'Wort an der Schreibmarke',

  // Settings
  'setting.locale.name': 'Sprachregeln',
  'setting.locale.desc': 'Türkisch und Aserbaidschanisch ordnen das i mit und ohne Punkt anders zu als alle anderen Sprachen.',
  'setting.preserveAcronyms.name': 'Akronyme unverändert lassen',
  'setting.preserveAcronyms.desc':
    'Lässt Akronyme wie NASA und PDF sowie Namen wie iPhone, macOS und GitHub unverändert. Wird ignoriert, wenn die ganze Auswahl schon in Großbuchstaben steht, weil dann jedes Wort wie ein Akronym aussieht.',
  'setting.stopWords.name': 'Wörter, die die Titel-Schreibweise klein lässt',
  'setting.stopWords.desc': 'Durch Kommas getrennt. Das erste und das letzte Wort eines Titels werden immer großgeschrieben, was diese Liste auch sagt.',
  'setting.removeHyphenOnJoin.name': 'Bindestrich beim Verbinden von Zeilen entfernen',
  'setting.removeHyphenOnJoin.desc':
    'Ein PDF trennt ein Wort als "trans-" und "lation". Schalte dies bei Texten aus, in denen ein echtes Kompositum wie "well-known" wahrscheinlicher ist als ein getrenntes Wort.',
  'setting.caseTarget.name': 'Ohne Auswahl die Schreibweise ändern von',
  'setting.caseTarget.desc': 'Der ganzen Zeile oder nur des Wortes an der Schreibmarke.',
  'setting.tidyInvisibles.name': 'Unsichtbare Zeichen entfernen',
  'setting.tidyInvisibles.desc': 'Nullbreite Zeichen und weiche Trennstriche fallen weg; geschützte Leerzeichen werden zu normalen Leerzeichen.',
  'setting.tidyLigatures.name': 'Ligaturen ersetzen',
  'setting.tidyLigatures.desc': 'ﬁ und ﬂ werden zu fi und fl.',
  'setting.tidyJoin.name': 'Umbrochene Zeilen verbinden',
  'setting.tidyJoin.desc': 'Verbindet einen fest über mehrere Zeilen umbrochenen Absatz. Standardmäßig aus: Es ändert die Zeilenstruktur.',
  'setting.tidySpaces.name': 'Mehrfache Leerzeichen zusammenfassen',
  'setting.tidySpaces.desc': 'Folgen von Leerzeichen zwischen Wörtern werden zu einem. Einrückungen, Tabellen und Code bleiben unberührt.',
  'setting.tidyTrailing.name': 'Leerzeichen am Zeilenende entfernen',
  'setting.tidyTrailing.desc': 'Leerzeichen und Tabulatoren am Ende von Zeilen.',
  'setting.tidyBlank.name': 'Überzählige Leerzeilen entfernen',
  'setting.tidyBlank.desc': 'Folgen von Leerzeilen werden zu einer.',
  'setting.keepHardBreaks.name': 'Harte Zeilenumbrüche behalten',
  'setting.keepHardBreaks.desc':
    'Zwei Leerzeichen am Ende einer Textzeile sind in Markdown ein Zeilenumbruch, daher behält das Entfernen von Leerzeichen am Zeilenende sie. Schalte dies aus, um auch sie zu entfernen.',
  'setting.confirmTidy.name': 'Vor dem Aufräumen bestätigen',
  'setting.confirmTidy.desc': 'Zeigt vor dem Anwenden, wie viele Zeilen jeder Schritt ändern würde.',
  'setting.cleanOnPaste.name': 'Beim Einfügen aufräumen',
  'setting.cleanOnPaste.desc':
    'Führt die obigen Schritte für eingefügten einfachen Text aus. Nie in Code oder Frontmatter; Einfügen mit Formatierung überlässt es Obsidian. Standardmäßig aus.',
  'setting.keepImageAltText.name': 'Alternativtext von Bildern behalten',
  'setting.keepImageAltText.desc': 'Lässt die Beschreibung stehen, wenn ein Bild in einfachen Text umgewandelt wird, statt das Bild ganz zu entfernen.',

  // Settings: saved replacements
  'replacements.name': 'Deine Suchen-und-Ersetzen-Befehle',
  'replacements.desc':
    'Jede Ersetzung wird zu einem Befehl „Ersetzen: <Name>“, dem du ein Tastenkürzel geben kannst, und steht in „Gespeicherte Ersetzung ausführen…“. Sie wirkt auf die Auswahl oder, wenn nichts ausgewählt ist, auf die ganze Notiz und berührt nie Code oder Frontmatter.',
  'replacements.nameField': 'Name',
  'replacements.nameDesc': 'Der Befehl heißt „Ersetzen: <Name>“. Ohne Namen gibt es keinen Befehl.',
  'replacements.namePlaceholder': 'Gedankenstriche korrigieren',
  'replacements.delete': 'Diese Ersetzung löschen',
  'replacements.find': 'Suchen',
  'replacements.replaceWith': 'Ersetzen durch',
  'replacements.replaceWithDesc': 'Leer lassen, um die Treffer zu löschen. Bei aktivem regulärem Ausdruck ist $1 die erste Gruppe und \\n ein Zeilenumbruch.',
  'replacements.regex': 'Regulärer Ausdruck',
  'replacements.matchCase': 'Groß-/Kleinschreibung beachten',
  'replacements.add': 'Ersetzung hinzufügen',
};

export default de;
