import type { Messages } from '../i18n.ts';

const ru: Messages = {
  // Commands
  'command.upper': 'Верхний регистр',
  'command.lower': 'Нижний регистр',
  'command.title': 'Регистр заголовка',
  'command.sentence': 'Регистр предложения',
  'command.capitalizeWords': 'Каждое слово с заглавной буквы',
  'command.capitalizeSentences': 'Предложения с заглавной буквы, остальное без изменений',
  'command.cycle': 'Переключать регистр по кругу',
  'command.slug': 'Слаг (нижний регистр, без диакритики, через дефисы)',
  'command.joinLines': 'Склеить перенесённые строки',
  'command.dehyphenate': 'Склеить слова, разорванные переносом строки',
  'command.stripInvisibles': 'Удалить невидимые символы',
  'command.replaceLigatures': 'Заменить лигатуры',
  'command.straightenPunctuation': 'Выпрямить кавычки и тире',
  'command.removeTrailingWhitespace': 'Удалить пробелы в конце строк',
  'command.collapseSpaces': 'Сжать повторяющиеся пробелы',
  'command.unlink': 'Ссылки в обычный текст',
  'command.sortLines': 'Сортировать строки от А до Я',
  'command.sortLinesDesc': 'Сортировать строки от Я до А',
  'command.dedupeLines': 'Удалить повторяющиеся строки',
  'command.removeBlankLines': 'Удалить пустые строки',
  'command.collapseBlankLines': 'Удалить лишние пустые строки (оставить одну)',
  'command.tidyNote': 'Привести заметку в порядок',
  'command.pickCase': 'Изменить регистр…',
  'command.runSavedReplacement': 'Выполнить сохранённую замену…',
  'command.replace': 'Замена: {name}',

  // Notices
  'notice.nothingToFormat': 'Форматировать нечего.',
  'notice.nothingToTidy': 'Приводить в порядок нечего.',
  'notice.noTidySteps': 'Ни один шаг наведения порядка не включён. Выберите шаги в настройках.',
  'notice.noSavedReplacements': 'Сохранённых замен пока нет. Добавьте их в настройках плагина.',
  'notice.replacementProblem': 'Замена: {name}: {problem}',
  'notice.unnamed': 'без названия',
  'notice.skippedInCode': 'Выделение начинается или заканчивается внутри кода, поэтому оно не тронуто.',
  'notice.noMatches': 'Нет совпадений для «{name}».',
  'notice.replacements.one': 'Сделана 1 замена.',
  'notice.replacements.other': 'Сделано замен: {count}.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Выберите регистр для выделенного текста',
  'modal.noChange': 'Без изменений',
  'modal.pickReplacement': 'Выберите сохранённую замену для выполнения',
  'modal.noName': '(без названия)',
  'modal.tidy.line.one': '{step}: 1 строка',
  'modal.tidy.line.other': '{step}: строк — {count}',
  'modal.tidy.confirm': 'Привести в порядок',
  'modal.tidy.cancel': 'Отмена',

  // The steps of Tidy note
  'tidy.invisibles': 'Удалить невидимые символы',
  'tidy.ligatures': 'Заменить лигатуры',
  'tidy.join': 'Склеить перенесённые строки',
  'tidy.spaces': 'Сжать повторяющиеся пробелы',
  'tidy.trailing': 'Удалить пробелы в конце строк',
  'tidy.blank': 'Удалить лишние пустые строки',

  // Why a saved replacement cannot run
  'error.findEmpty': 'Искомый текст пуст.',
  'error.invalidRegex': 'Некорректное регулярное выражение: {reason}',

  // Settings: headings
  'heading.case': 'Регистр',
  'heading.cleanup': 'Очистка',
  'heading.tidy': 'Привести заметку в порядок',
  'heading.replacements': 'Сохранённые замены',

  // Settings: dropdown options
  'option.systemDefault': 'Как в системе',
  'option.turkish': 'Турецкий',
  'option.azerbaijani': 'Азербайджанский',
  'option.lithuanian': 'Литовский',
  'option.wholeLine': 'Вся строка',
  'option.wordAtCaret': 'Слово под курсором',

  // Settings
  'setting.locale.name': 'Правила языка',
  'setting.locale.desc': 'В турецком и азербайджанском языках i с точкой и без точки соответствуют друг другу иначе, чем во всех остальных.',
  'setting.preserveAcronyms.name': 'Не менять аббревиатуры',
  'setting.preserveAcronyms.desc':
    'Оставляет без изменений аббревиатуры вроде NASA и PDF и названия вроде iPhone, macOS и GitHub. Не учитывается, если всё выделение уже в верхнем регистре: тогда каждое слово похоже на аббревиатуру.',
  'setting.stopWords.name': 'Слова, которые регистр заголовка оставляет строчными',
  'setting.stopWords.desc': 'Через запятую. Первое и последнее слова заголовка всегда пишутся с заглавной буквы, что бы ни говорил этот список.',
  'setting.removeHyphenOnJoin.name': 'Убирать дефис при склейке строк',
  'setting.removeHyphenOnJoin.desc':
    'PDF разрывает слово как "trans-" и "lation". Отключите для текстов, где настоящее составное слово вроде "well-known" вероятнее, чем разорванное.',
  'setting.caseTarget.name': 'Без выделения менять регистр у',
  'setting.caseTarget.desc': 'Всей строки или только слова под курсором.',
  'setting.tidyInvisibles.name': 'Удалить невидимые символы',
  'setting.tidyInvisibles.desc': 'Символы нулевой ширины и мягкие переносы удаляются; неразрывные пробелы становятся обычными.',
  'setting.tidyLigatures.name': 'Заменить лигатуры',
  'setting.tidyLigatures.desc': 'ﬁ и ﬂ становятся fi и fl.',
  'setting.tidyJoin.name': 'Склеить перенесённые строки',
  'setting.tidyJoin.desc': 'Склеивает абзац, жёстко разбитый на строки. По умолчанию выключено: меняет структуру строк.',
  'setting.tidySpaces.name': 'Сжать повторяющиеся пробелы',
  'setting.tidySpaces.desc': 'Несколько пробелов подряд между словами становятся одним. Отступы, таблицы и код не затрагиваются.',
  'setting.tidyTrailing.name': 'Удалить пробелы в конце строк',
  'setting.tidyTrailing.desc': 'Пробелы и табуляции в конце строк.',
  'setting.tidyBlank.name': 'Удалить лишние пустые строки',
  'setting.tidyBlank.desc': 'Несколько пустых строк подряд становятся одной.',
  'setting.keepHardBreaks.name': 'Сохранять жёсткие переносы строк',
  'setting.keepHardBreaks.desc':
    'Два пробела в конце строки текста в Markdown означают перенос строки, поэтому при удалении пробелов в конце строк они сохраняются. Отключите, чтобы удалять и их.',
  'setting.confirmTidy.name': 'Подтверждать перед наведением порядка',
  'setting.confirmTidy.desc': 'Перед применением показывает, сколько строк изменит каждый шаг.',
  'setting.cleanOnPaste.name': 'Наводить порядок при вставке',
  'setting.cleanOnPaste.desc':
    'Выполняет описанные выше шаги над вставляемым обычным текстом. Никогда не в коде или frontmatter; вставка с форматированием остаётся за Obsidian. По умолчанию выключено.',
  'setting.keepImageAltText.name': 'Сохранять альтернативный текст изображений',
  'setting.keepImageAltText.desc': 'Оставляет описание, когда изображение превращается в обычный текст, вместо полного удаления изображения.',

  // Settings: saved replacements
  'replacements.name': 'Ваши команды поиска и замены',
  'replacements.desc':
    'Каждая замена становится командой «Замена: <название>», которой можно назначить сочетание клавиш, и попадает в список «Выполнить сохранённую замену…». Она работает с выделением, а если ничего не выделено, со всей заметкой, и никогда не затрагивает код и frontmatter.',
  'replacements.nameField': 'Название',
  'replacements.nameDesc': 'Команда называется «Замена: <название>». Без названия команды нет.',
  'replacements.namePlaceholder': 'Исправить тире',
  'replacements.delete': 'Удалить эту замену',
  'replacements.find': 'Найти',
  'replacements.replaceWith': 'Заменить на',
  'replacements.replaceWithDesc': 'Оставьте пустым, чтобы удалять совпадения. При включённом регулярном выражении $1 — первая группа, а \\n — перенос строки.',
  'replacements.regex': 'Регулярное выражение',
  'replacements.matchCase': 'Учитывать регистр',
  'replacements.add': 'Добавить замену',
};

export default ru;
