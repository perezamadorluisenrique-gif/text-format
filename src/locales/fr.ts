import type { Messages } from '../i18n.ts';

const fr: Messages = {
  // Commands
  'command.upper': 'Majuscules',
  'command.lower': 'Minuscules',
  'command.title': 'Casse de titre',
  'command.sentence': 'Casse de phrase',
  'command.capitalizeWords': 'Majuscule à chaque mot',
  'command.capitalizeSentences': 'Majuscule en début de phrase, le reste inchangé',
  'command.cycle': 'Alterner la casse',
  'command.slug': 'Slug (minuscules, sans accents, avec traits d’union)',
  'command.joinLines': 'Joindre les lignes coupées',
  'command.dehyphenate': 'Rejoindre les mots coupés entre deux lignes',
  'command.stripInvisibles': 'Supprimer les caractères invisibles',
  'command.replaceLigatures': 'Remplacer les ligatures',
  'command.straightenPunctuation': 'Redresser les guillemets et les tirets',
  'command.removeTrailingWhitespace': 'Supprimer les espaces en fin de ligne',
  'command.collapseSpaces': 'Réduire les espaces multiples',
  'command.unlink': 'Liens en texte brut',
  'command.sortLines': 'Trier les lignes de A à Z',
  'command.sortLinesDesc': 'Trier les lignes de Z à A',
  'command.dedupeLines': 'Supprimer les lignes en double',
  'command.removeBlankLines': 'Supprimer les lignes vides',
  'command.collapseBlankLines': 'Supprimer les lignes vides en trop (en garder une)',
  'command.tidyNote': 'Mettre la note en ordre',
  'command.pickCase': 'Changer la casse…',
  'command.runSavedReplacement': 'Exécuter un remplacement enregistré…',
  'command.replace': 'Remplacer : {name}',

  // Notices
  'notice.nothingToFormat': 'Rien à mettre en forme.',
  'notice.nothingToTidy': 'Rien à mettre en ordre.',
  'notice.noTidySteps': 'Aucune étape de mise en ordre n’est activée. Choisissez-en dans les réglages.',
  'notice.noSavedReplacements': 'Aucun remplacement enregistré pour l’instant. Ajoutez-en dans les réglages du module.',
  'notice.replacementProblem': 'Remplacer : {name} : {problem}',
  'notice.unnamed': 'sans nom',
  'notice.skippedInCode': 'La sélection commence ou se termine dans du code ; elle a donc été laissée telle quelle.',
  'notice.noMatches': 'Aucune correspondance pour « {name} ».',
  'notice.replacements.one': '1 remplacement effectué.',
  'notice.replacements.other': '{count} remplacements effectués.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Choisir une casse pour la sélection',
  'modal.noChange': 'Aucun changement',
  'modal.pickReplacement': 'Choisir un remplacement enregistré à exécuter',
  'modal.noName': '(sans nom)',
  'modal.tidy.line.one': '{step} : 1 ligne',
  'modal.tidy.line.other': '{step} : {count} lignes',
  'modal.tidy.confirm': 'Mettre en ordre',
  'modal.tidy.cancel': 'Annuler',

  // The steps of Tidy note
  'tidy.invisibles': 'Supprimer les caractères invisibles',
  'tidy.ligatures': 'Remplacer les ligatures',
  'tidy.join': 'Joindre les lignes coupées',
  'tidy.spaces': 'Réduire les espaces multiples',
  'tidy.trailing': 'Supprimer les espaces en fin de ligne',
  'tidy.blank': 'Supprimer les lignes vides en trop',

  // Why a saved replacement cannot run
  'error.findEmpty': 'Le texte à rechercher est vide.',
  'error.invalidRegex': 'Expression régulière non valide : {reason}',

  // Settings: headings
  'heading.case': 'Casse',
  'heading.cleanup': 'Nettoyage',
  'heading.tidy': 'Mettre la note en ordre',
  'heading.replacements': 'Remplacements enregistrés',

  // Settings: dropdown options
  'option.systemDefault': 'Valeur par défaut du système',
  'option.turkish': 'Turc',
  'option.azerbaijani': 'Azéri',
  'option.lithuanian': 'Lituanien',
  'option.wholeLine': 'Ligne entière',
  'option.wordAtCaret': 'Mot sous le curseur',

  // Settings
  'setting.locale.name': 'Règles de la langue',
  'setting.locale.desc': 'Le turc et l’azéri associent le i avec et sans point autrement que toutes les autres langues.',
  'setting.preserveAcronyms.name': 'Conserver les sigles tels quels',
  'setting.preserveAcronyms.desc':
    'Laisse tels quels les sigles comme NASA et PDF, et les noms comme iPhone, macOS et GitHub. Ignoré lorsque toute la sélection est déjà en majuscules, car chaque mot ressemble alors à un sigle.',
  'setting.stopWords.name': 'Mots que la casse de titre laisse en minuscules',
  'setting.stopWords.desc': 'Séparés par des virgules. Le premier et le dernier mot d’un titre prennent toujours une majuscule, quoi que dise cette liste.',
  'setting.removeHyphenOnJoin.name': 'Supprimer le trait d’union en joignant les lignes',
  'setting.removeHyphenOnJoin.desc':
    'Un PDF coupe un mot en "trans-" et "lation". Désactivez cette option pour les textes où un vrai mot composé comme "well-known" est plus probable qu’un mot coupé.',
  'setting.caseTarget.name': 'Sans sélection, changer la casse de',
  'setting.caseTarget.desc': 'La ligne entière, ou seulement le mot sous le curseur.',
  'setting.tidyInvisibles.name': 'Supprimer les caractères invisibles',
  'setting.tidyInvisibles.desc': 'Les caractères de largeur nulle et les traits d’union conditionnels disparaissent ; les espaces insécables deviennent des espaces.',
  'setting.tidyLigatures.name': 'Remplacer les ligatures',
  'setting.tidyLigatures.desc': 'ﬁ et ﬂ deviennent fi et fl.',
  'setting.tidyJoin.name': 'Joindre les lignes coupées',
  'setting.tidyJoin.desc': 'Fusionne un paragraphe coupé en dur sur plusieurs lignes. Désactivé par défaut : cela change la structure des lignes.',
  'setting.tidySpaces.name': 'Réduire les espaces multiples',
  'setting.tidySpaces.desc': 'Les suites d’espaces entre les mots deviennent un seul espace. L’indentation, les tableaux et le code ne sont pas touchés.',
  'setting.tidyTrailing.name': 'Supprimer les espaces en fin de ligne',
  'setting.tidyTrailing.desc': 'Les espaces et tabulations à la fin des lignes.',
  'setting.tidyBlank.name': 'Supprimer les lignes vides en trop',
  'setting.tidyBlank.desc': 'Les suites de lignes vides deviennent une seule ligne.',
  'setting.keepHardBreaks.name': 'Conserver les sauts de ligne forcés',
  'setting.keepHardBreaks.desc':
    'Deux espaces à la fin d’une ligne de texte forment un saut de ligne en Markdown ; la suppression des espaces en fin de ligne les conserve donc. Désactivez cette option pour les supprimer aussi.',
  'setting.confirmTidy.name': 'Confirmer avant de mettre en ordre',
  'setting.confirmTidy.desc': 'Affiche le nombre de lignes que chaque étape modifierait avant de l’appliquer.',
  'setting.cleanOnPaste.name': 'Mettre en ordre au collage',
  'setting.cleanOnPaste.desc':
    'Exécute les étapes ci-dessus sur le texte brut que vous collez. Jamais dans du code ou du frontmatter, et les collages avec mise en forme sont laissés à Obsidian. Désactivé par défaut.',
  'setting.keepImageAltText.name': 'Conserver le texte alternatif des images',
  'setting.keepImageAltText.desc': 'Garde la description lorsqu’une image est convertie en texte brut, au lieu de supprimer entièrement l’image.',

  // Settings: saved replacements
  'replacements.name': 'Vos commandes de recherche et remplacement',
  'replacements.desc':
    'Chaque remplacement devient une commande « Remplacer : <nom> » à laquelle vous pouvez attribuer un raccourci, et figure dans « Exécuter un remplacement enregistré… ». Elle agit sur la sélection, ou sur toute la note si rien n’est sélectionné, et ne touche jamais au code ni au frontmatter.',
  'replacements.nameField': 'Nom',
  'replacements.nameDesc': 'La commande s’appelle « Remplacer : <nom> ». Sans nom, il n’y a pas de commande.',
  'replacements.namePlaceholder': 'Corriger les tirets',
  'replacements.delete': 'Supprimer ce remplacement',
  'replacements.find': 'Rechercher',
  'replacements.replaceWith': 'Remplacer par',
  'replacements.replaceWithDesc': 'Laissez vide pour supprimer les correspondances. Avec l’expression régulière activée, $1 est le premier groupe et \\n un saut de ligne.',
  'replacements.regex': 'Expression régulière',
  'replacements.matchCase': 'Respecter la casse',
  'replacements.add': 'Ajouter un remplacement',
};

export default fr;
