import type { Messages } from '../i18n.ts';

const es: Messages = {
  // Commands
  'command.upper': 'Mayúsculas',
  'command.lower': 'Minúsculas',
  'command.title': 'Mayúsculas de título',
  'command.sentence': 'Mayúscula de oración',
  'command.capitalizeWords': 'Poner en mayúscula cada palabra',
  'command.capitalizeSentences': 'Poner en mayúscula las oraciones, sin tocar el resto',
  'command.cycle': 'Alternar mayúsculas y minúsculas',
  'command.slug': 'Slug (minúsculas, sin acentos, con guiones)',
  'command.joinLines': 'Unir líneas partidas',
  'command.dehyphenate': 'Reunir palabras partidas entre líneas',
  'command.stripInvisibles': 'Quitar caracteres invisibles',
  'command.replaceLigatures': 'Reemplazar ligaduras',
  'command.straightenPunctuation': 'Enderezar comillas y rayas',
  'command.removeTrailingWhitespace': 'Quitar espacios al final de las líneas',
  'command.collapseSpaces': 'Reducir espacios múltiples',
  'command.unlink': 'Enlaces a texto sin formato',
  'command.sortLines': 'Ordenar líneas de la A a la Z',
  'command.sortLinesDesc': 'Ordenar líneas de la Z a la A',
  'command.dedupeLines': 'Quitar líneas duplicadas',
  'command.removeBlankLines': 'Quitar líneas en blanco',
  'command.collapseBlankLines': 'Quitar líneas en blanco sobrantes (dejar una)',
  'command.tidyNote': 'Ordenar nota',
  'command.pickCase': 'Cambiar mayúsculas y minúsculas…',
  'command.runSavedReplacement': 'Ejecutar un reemplazo guardado…',
  'command.replace': 'Reemplazar: {name}',

  // Notices
  'notice.nothingToFormat': 'No hay nada que formatear.',
  'notice.nothingToTidy': 'No hay nada que ordenar.',
  'notice.noTidySteps': 'No hay pasos de orden activados. Elige alguno en los ajustes.',
  'notice.noSavedReplacements': 'Aún no hay reemplazos guardados. Añade alguno en los ajustes del complemento.',
  'notice.replacementProblem': 'Reemplazar: {name}: {problem}',
  'notice.unnamed': 'sin nombre',
  'notice.skippedInCode': 'La selección empieza o termina dentro de código, así que se dejó como estaba.',
  'notice.noMatches': 'No hay coincidencias para "{name}".',
  'notice.replacements.one': 'Se hizo 1 reemplazo.',
  'notice.replacements.other': 'Se hicieron {count} reemplazos.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Elige mayúsculas o minúsculas para la selección',
  'modal.noChange': 'Sin cambios',
  'modal.pickReplacement': 'Elige un reemplazo guardado para ejecutar',
  'modal.noName': '(sin nombre)',
  'modal.tidy.line.one': '{step}: 1 línea',
  'modal.tidy.line.other': '{step}: {count} líneas',
  'modal.tidy.confirm': 'Ordenar',
  'modal.tidy.cancel': 'Cancelar',

  // The steps of Tidy note
  'tidy.invisibles': 'Quitar caracteres invisibles',
  'tidy.ligatures': 'Reemplazar ligaduras',
  'tidy.join': 'Unir líneas partidas',
  'tidy.spaces': 'Reducir espacios múltiples',
  'tidy.trailing': 'Quitar espacios al final de las líneas',
  'tidy.blank': 'Quitar líneas en blanco sobrantes',

  // Why a saved replacement cannot run
  'error.findEmpty': 'El texto a buscar está vacío.',
  'error.invalidRegex': 'No es una expresión regular válida: {reason}',

  // Settings: headings
  'heading.case': 'Mayúsculas y minúsculas',
  'heading.cleanup': 'Limpieza',
  'heading.tidy': 'Ordenar nota',
  'heading.replacements': 'Reemplazos guardados',

  // Settings: dropdown options
  'option.systemDefault': 'Predeterminado del sistema',
  'option.turkish': 'Turco',
  'option.azerbaijani': 'Azerí',
  'option.lithuanian': 'Lituano',
  'option.wholeLine': 'Línea completa',
  'option.wordAtCaret': 'Palabra bajo el cursor',

  // Settings
  'setting.locale.name': 'Reglas del idioma',
  'setting.locale.desc': 'El turco y el azerí asignan la i con punto y sin punto de forma distinta al resto de idiomas.',
  'setting.preserveAcronyms.name': 'Respetar las siglas',
  'setting.preserveAcronyms.desc':
    'Deja como están siglas como NASA y PDF, y nombres como iPhone, macOS y GitHub. Se ignora cuando toda la selección ya está en mayúsculas, porque entonces todas las palabras parecen siglas.',
  'setting.stopWords.name': 'Palabras que el título mantiene en minúscula',
  'setting.stopWords.desc': 'Separadas por comas. La primera y la última palabra de un título siempre van en mayúscula, diga lo que diga esta lista.',
  'setting.removeHyphenOnJoin.name': 'Quitar el guion al unir líneas',
  'setting.removeHyphenOnJoin.desc':
    'Un PDF parte una palabra como "trans-" y "lation". Desactívalo para textos donde un compuesto real como "well-known" es más probable que una palabra partida.',
  'setting.caseTarget.name': 'Sin selección, cambiar las mayúsculas de',
  'setting.caseTarget.desc': 'La línea completa, o solo la palabra bajo el cursor.',
  'setting.tidyInvisibles.name': 'Quitar caracteres invisibles',
  'setting.tidyInvisibles.desc': 'Se eliminan los caracteres de ancho cero y los guiones suaves; los espacios de no separación pasan a ser espacios normales.',
  'setting.tidyLigatures.name': 'Reemplazar ligaduras',
  'setting.tidyLigatures.desc': 'ﬁ y ﬂ pasan a fi y fl.',
  'setting.tidyJoin.name': 'Unir líneas partidas',
  'setting.tidyJoin.desc': 'Une un párrafo partido con saltos de línea forzados. Desactivado por defecto: cambia la estructura de las líneas.',
  'setting.tidySpaces.name': 'Reducir espacios múltiples',
  'setting.tidySpaces.desc': 'Las series de espacios entre palabras pasan a ser uno. La sangría, las tablas y el código no se tocan.',
  'setting.tidyTrailing.name': 'Quitar espacios al final de las líneas',
  'setting.tidyTrailing.desc': 'Espacios y tabulaciones al final de las líneas.',
  'setting.tidyBlank.name': 'Quitar líneas en blanco sobrantes',
  'setting.tidyBlank.desc': 'Las series de líneas en blanco pasan a ser una.',
  'setting.keepHardBreaks.name': 'Conservar los saltos de línea forzados',
  'setting.keepHardBreaks.desc':
    'Dos espacios al final de una línea de texto son un salto de línea en Markdown, así que al quitar los espacios finales se conservan. Desactívalo para quitarlos también.',
  'setting.confirmTidy.name': 'Confirmar antes de ordenar',
  'setting.confirmTidy.desc': 'Muestra cuántas líneas cambiaría cada paso antes de aplicarlo.',
  'setting.cleanOnPaste.name': 'Ordenar al pegar',
  'setting.cleanOnPaste.desc':
    'Aplica los pasos anteriores al texto sin formato que pegas. Nunca dentro de código o frontmatter, y los pegados con formato se dejan a Obsidian. Desactivado por defecto.',
  'setting.keepImageAltText.name': 'Conservar el texto alternativo de las imágenes',
  'setting.keepImageAltText.desc': 'Deja la descripción cuando una imagen se convierte en texto sin formato, en lugar de quitar la imagen por completo.',

  // Settings: saved replacements
  'replacements.name': 'Tus comandos de buscar y reemplazar',
  'replacements.desc':
    'Cada reemplazo se convierte en un comando, "Reemplazar: <nombre>", al que puedes asignar un atajo, y aparece en "Ejecutar un reemplazo guardado…". Actúa sobre la selección, o sobre toda la nota si no hay nada seleccionado, y nunca toca el código ni el frontmatter.',
  'replacements.nameField': 'Nombre',
  'replacements.nameDesc': 'El comando se llama "Reemplazar: <nombre>". Sin nombre no hay comando.',
  'replacements.namePlaceholder': 'Arreglar rayas',
  'replacements.delete': 'Eliminar este reemplazo',
  'replacements.find': 'Buscar',
  'replacements.replaceWith': 'Reemplazar por',
  'replacements.replaceWithDesc': 'Déjalo vacío para eliminar las coincidencias. Con expresión regular activada, $1 es el primer grupo y \\n un salto de línea.',
  'replacements.regex': 'Expresión regular',
  'replacements.matchCase': 'Distinguir mayúsculas y minúsculas',
  'replacements.add': 'Añadir un reemplazo',
};

export default es;
