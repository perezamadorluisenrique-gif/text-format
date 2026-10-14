import type { Messages } from '../i18n.ts';

const ptBR: Messages = {
  // Commands
  'command.upper': 'Maiúsculas',
  'command.lower': 'Minúsculas',
  'command.title': 'Maiúsculas de título',
  'command.sentence': 'Maiúscula de frase',
  'command.capitalizeWords': 'Capitalizar cada palavra',
  'command.capitalizeSentences': 'Capitalizar frases, mantendo o resto',
  'command.cycle': 'Alternar maiúsculas e minúsculas',
  'command.slug': 'Slug (minúsculas, sem acentos, com hifens)',
  'command.joinLines': 'Juntar linhas quebradas',
  'command.dehyphenate': 'Reunir palavras divididas entre linhas',
  'command.stripInvisibles': 'Remover caracteres invisíveis',
  'command.replaceLigatures': 'Substituir ligaduras',
  'command.straightenPunctuation': 'Endireitar aspas e travessões',
  'command.removeTrailingWhitespace': 'Remover espaços no fim das linhas',
  'command.collapseSpaces': 'Reduzir espaços múltiplos',
  'command.unlink': 'Links para texto simples',
  'command.sortLines': 'Ordenar linhas de A a Z',
  'command.sortLinesDesc': 'Ordenar linhas de Z a A',
  'command.dedupeLines': 'Remover linhas duplicadas',
  'command.removeBlankLines': 'Remover linhas em branco',
  'command.collapseBlankLines': 'Remover linhas em branco extras (manter uma)',
  'command.tidyNote': 'Organizar nota',
  'command.pickCase': 'Alterar maiúsculas e minúsculas…',
  'command.runSavedReplacement': 'Executar uma substituição salva…',
  'command.replace': 'Substituir: {name}',

  // Notices
  'notice.nothingToFormat': 'Nada para formatar.',
  'notice.nothingToTidy': 'Nada para organizar.',
  'notice.noTidySteps': 'Nenhuma etapa de organização está ativada. Escolha algumas nas configurações.',
  'notice.noSavedReplacements': 'Ainda não há substituições salvas. Adicione algumas nas configurações do plugin.',
  'notice.replacementProblem': 'Substituir: {name}: {problem}',
  'notice.unnamed': 'sem nome',
  'notice.skippedInCode': 'A seleção começa ou termina dentro de código, então foi deixada como estava.',
  'notice.noMatches': 'Nenhuma ocorrência de "{name}".',
  'notice.replacements.one': '1 substituição feita.',
  'notice.replacements.other': '{count} substituições feitas.',

  // Pickers and the tidy confirmation
  'modal.pickCase': 'Escolha as maiúsculas e minúsculas para a seleção',
  'modal.noChange': 'Sem alteração',
  'modal.pickReplacement': 'Escolha uma substituição salva para executar',
  'modal.noName': '(sem nome)',
  'modal.tidy.line.one': '{step}: 1 linha',
  'modal.tidy.line.other': '{step}: {count} linhas',
  'modal.tidy.confirm': 'Organizar',
  'modal.tidy.cancel': 'Cancelar',

  // The steps of Tidy note
  'tidy.invisibles': 'Remover caracteres invisíveis',
  'tidy.ligatures': 'Substituir ligaduras',
  'tidy.join': 'Juntar linhas quebradas',
  'tidy.spaces': 'Reduzir espaços múltiplos',
  'tidy.trailing': 'Remover espaços no fim das linhas',
  'tidy.blank': 'Remover linhas em branco extras',

  // Why a saved replacement cannot run
  'error.findEmpty': 'O texto a localizar está vazio.',
  'error.invalidRegex': 'Não é uma expressão regular válida: {reason}',

  // Settings: headings
  'heading.case': 'Maiúsculas e minúsculas',
  'heading.cleanup': 'Limpeza',
  'heading.tidy': 'Organizar nota',
  'heading.replacements': 'Substituições salvas',

  // Settings: dropdown options
  'option.systemDefault': 'Padrão do sistema',
  'option.turkish': 'Turco',
  'option.azerbaijani': 'Azerbaijano',
  'option.lithuanian': 'Lituano',
  'option.wholeLine': 'Linha inteira',
  'option.wordAtCaret': 'Palavra sob o cursor',

  // Settings
  'setting.locale.name': 'Regras do idioma',
  'setting.locale.desc': 'O turco e o azerbaijano associam o i com ponto e sem ponto de forma diferente de todos os outros idiomas.',
  'setting.preserveAcronyms.name': 'Manter siglas como estão',
  'setting.preserveAcronyms.desc':
    'Deixa como estão siglas como NASA e PDF e nomes como iPhone, macOS e GitHub. Ignorado quando toda a seleção já está em maiúsculas, pois então todas as palavras parecem siglas.',
  'setting.stopWords.name': 'Palavras que o título mantém em minúsculas',
  'setting.stopWords.desc': 'Separadas por vírgulas. A primeira e a última palavra de um título sempre ficam em maiúscula, seja qual for esta lista.',
  'setting.removeHyphenOnJoin.name': 'Remover o hífen ao juntar linhas',
  'setting.removeHyphenOnJoin.desc':
    'Um PDF quebra uma palavra como "trans-" e "lation". Desative para textos em que um composto real como "well-known" é mais provável que uma palavra quebrada.',
  'setting.caseTarget.name': 'Sem seleção, alterar as maiúsculas de',
  'setting.caseTarget.desc': 'A linha inteira, ou apenas a palavra sob o cursor.',
  'setting.tidyInvisibles.name': 'Remover caracteres invisíveis',
  'setting.tidyInvisibles.desc': 'Caracteres de largura zero e hifens suaves saem; espaços não separáveis viram espaços comuns.',
  'setting.tidyLigatures.name': 'Substituir ligaduras',
  'setting.tidyLigatures.desc': 'ﬁ e ﬂ viram fi e fl.',
  'setting.tidyJoin.name': 'Juntar linhas quebradas',
  'setting.tidyJoin.desc': 'Une um parágrafo quebrado à força em várias linhas. Desativado por padrão: altera a estrutura das linhas.',
  'setting.tidySpaces.name': 'Reduzir espaços múltiplos',
  'setting.tidySpaces.desc': 'Sequências de espaços entre palavras viram um só. Recuos, tabelas e código não são alterados.',
  'setting.tidyTrailing.name': 'Remover espaços no fim das linhas',
  'setting.tidyTrailing.desc': 'Espaços e tabulações no fim das linhas.',
  'setting.tidyBlank.name': 'Remover linhas em branco extras',
  'setting.tidyBlank.desc': 'Sequências de linhas em branco viram uma só.',
  'setting.keepHardBreaks.name': 'Manter quebras de linha forçadas',
  'setting.keepHardBreaks.desc':
    'Dois espaços no fim de uma linha de texto são uma quebra de linha no Markdown, então a remoção de espaços no fim das linhas os mantém. Desative para removê-los também.',
  'setting.confirmTidy.name': 'Confirmar antes de organizar',
  'setting.confirmTidy.desc': 'Mostra quantas linhas cada etapa alteraria antes de aplicar.',
  'setting.cleanOnPaste.name': 'Organizar ao colar',
  'setting.cleanOnPaste.desc':
    'Executa as etapas acima no texto simples que você cola. Nunca dentro de código ou frontmatter, e colagens com formatação ficam por conta do Obsidian. Desativado por padrão.',
  'setting.keepImageAltText.name': 'Manter o texto alternativo das imagens',
  'setting.keepImageAltText.desc': 'Mantém a descrição quando uma imagem é convertida em texto simples, em vez de remover a imagem por completo.',

  // Settings: saved replacements
  'replacements.name': 'Seus comandos de localizar e substituir',
  'replacements.desc':
    'Cada substituição vira um comando, "Substituir: <nome>", ao qual você pode atribuir um atalho, e aparece em "Executar uma substituição salva…". Atua na seleção, ou na nota inteira quando nada está selecionado, e nunca mexe em código nem em frontmatter.',
  'replacements.nameField': 'Nome',
  'replacements.nameDesc': 'O comando se chama "Substituir: <nome>". Sem nome, não há comando.',
  'replacements.namePlaceholder': 'Corrigir travessões',
  'replacements.delete': 'Excluir esta substituição',
  'replacements.find': 'Localizar',
  'replacements.replaceWith': 'Substituir por',
  'replacements.replaceWithDesc': 'Deixe vazio para excluir as ocorrências. Com expressão regular ativada, $1 é o primeiro grupo e \\n uma quebra de linha.',
  'replacements.regex': 'Expressão regular',
  'replacements.matchCase': 'Diferenciar maiúsculas de minúsculas',
  'replacements.add': 'Adicionar uma substituição',
};

export default ptBR;
