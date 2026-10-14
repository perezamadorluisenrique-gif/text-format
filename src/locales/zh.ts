import type { Messages } from '../i18n.ts';

const zh: Messages = {
  // Commands
  'command.upper': '大写',
  'command.lower': '小写',
  'command.title': '标题式大小写',
  'command.sentence': '句子式大小写',
  'command.capitalizeWords': '每个单词首字母大写',
  'command.capitalizeSentences': '句首字母大写，其余保持不变',
  'command.cycle': '循环切换大小写',
  'command.slug': 'Slug（小写、去除重音符号、连字符）',
  'command.joinLines': '合并折行',
  'command.dehyphenate': '重新连接被分行拆开的单词',
  'command.stripInvisibles': '移除不可见字符',
  'command.replaceLigatures': '替换连字',
  'command.straightenPunctuation': '将引号和破折号转为直形',
  'command.removeTrailingWhitespace': '移除行尾空白',
  'command.collapseSpaces': '合并多个空格',
  'command.unlink': '链接转为纯文本',
  'command.sortLines': '按 A 到 Z 排序行',
  'command.sortLinesDesc': '按 Z 到 A 排序行',
  'command.dedupeLines': '移除重复行',
  'command.removeBlankLines': '移除空行',
  'command.collapseBlankLines': '移除多余空行（保留一行）',
  'command.tidyNote': '整理笔记',
  'command.pickCase': '更改大小写…',
  'command.runSavedReplacement': '运行已保存的替换…',
  'command.replace': '替换：{name}',

  // Notices
  'notice.nothingToFormat': '没有需要格式化的内容。',
  'notice.nothingToTidy': '没有需要整理的内容。',
  'notice.noTidySteps': '没有开启任何整理步骤。请在设置中选择。',
  'notice.noSavedReplacements': '还没有已保存的替换。请在插件设置中添加。',
  'notice.replacementProblem': '替换：{name}：{problem}',
  'notice.unnamed': '未命名',
  'notice.skippedInCode': '所选内容的开头或结尾位于代码中，因此未作处理。',
  'notice.noMatches': '没有匹配“{name}”的内容。',
  'notice.replacements.one': '已完成 1 处替换。',
  'notice.replacements.other': '已完成 {count} 处替换。',

  // Pickers and the tidy confirmation
  'modal.pickCase': '为所选内容选择大小写',
  'modal.noChange': '无变化',
  'modal.pickReplacement': '选择要运行的已保存替换',
  'modal.noName': '（无名称）',
  'modal.tidy.line.one': '{step}：1 行',
  'modal.tidy.line.other': '{step}：{count} 行',
  'modal.tidy.confirm': '整理',
  'modal.tidy.cancel': '取消',

  // The steps of Tidy note
  'tidy.invisibles': '移除不可见字符',
  'tidy.ligatures': '替换连字',
  'tidy.join': '合并折行',
  'tidy.spaces': '合并多个空格',
  'tidy.trailing': '移除行尾空白',
  'tidy.blank': '移除多余空行',

  // Why a saved replacement cannot run
  'error.findEmpty': '查找内容为空。',
  'error.invalidRegex': '不是有效的正则表达式：{reason}',

  // Settings: headings
  'heading.case': '大小写',
  'heading.cleanup': '清理',
  'heading.tidy': '整理笔记',
  'heading.replacements': '已保存的替换',

  // Settings: dropdown options
  'option.systemDefault': '系统默认',
  'option.turkish': '土耳其语',
  'option.azerbaijani': '阿塞拜疆语',
  'option.lithuanian': '立陶宛语',
  'option.wholeLine': '整行',
  'option.wordAtCaret': '光标所在的单词',

  // Settings
  'setting.locale.name': '语言规则',
  'setting.locale.desc': '土耳其语和阿塞拜疆语对带点和不带点的 i 的大小写映射与其他语言不同。',
  'setting.preserveAcronyms.name': '保持首字母缩写不变',
  'setting.preserveAcronyms.desc':
    '保持 NASA、PDF 之类的首字母缩写，以及 iPhone、macOS、GitHub 之类的名称不变。当整段选中内容已全部大写时会被忽略，因为那时每个单词看起来都像缩写。',
  'setting.stopWords.name': '标题式大小写中保持小写的单词',
  'setting.stopWords.desc': '用逗号分隔。无论此列表如何设置，标题的第一个和最后一个单词始终大写。',
  'setting.removeHyphenOnJoin.name': '合并行时去掉连字符',
  'setting.removeHyphenOnJoin.desc': 'PDF 会把单词断成 "trans-" 和 "lation"。对于真正的复合词（如 "well-known"）比断开的单词更常见的文本，请关闭此项。',
  'setting.caseTarget.name': '没有选中内容时，更改大小写的范围',
  'setting.caseTarget.desc': '整行，或仅光标所在的单词。',
  'setting.tidyInvisibles.name': '移除不可见字符',
  'setting.tidyInvisibles.desc': '零宽字符和软连字符会被移除；不间断空格变为普通空格。',
  'setting.tidyLigatures.name': '替换连字',
  'setting.tidyLigatures.desc': 'ﬁ 和 ﬂ 变为 fi 和 fl。',
  'setting.tidyJoin.name': '合并折行',
  'setting.tidyJoin.desc': '合并被硬折行拆成多行的段落。默认关闭：它会改变行结构。',
  'setting.tidySpaces.name': '合并多个空格',
  'setting.tidySpaces.desc': '单词之间连续的空格变为一个。缩进、表格和代码不受影响。',
  'setting.tidyTrailing.name': '移除行尾空白',
  'setting.tidyTrailing.desc': '行尾的空格和制表符。',
  'setting.tidyBlank.name': '移除多余空行',
  'setting.tidyBlank.desc': '连续的空行变为一行。',
  'setting.keepHardBreaks.name': '保留硬换行',
  'setting.keepHardBreaks.desc': '在 Markdown 中，一行文字末尾的两个空格表示换行，因此移除行尾空白时会保留它们。关闭此项则一并去除。',
  'setting.confirmTidy.name': '整理前确认',
  'setting.confirmTidy.desc': '应用之前，显示每个步骤会更改多少行。',
  'setting.cleanOnPaste.name': '粘贴时整理',
  'setting.cleanOnPaste.desc': '对你粘贴的纯文本执行上面的步骤。绝不会在代码或 frontmatter 内执行，带格式的粘贴交给 Obsidian 处理。默认关闭。',
  'setting.keepImageAltText.name': '保留图片替代文本',
  'setting.keepImageAltText.desc': '将图片转为纯文本时保留其描述，而不是整个移除图片。',

  // Settings: saved replacements
  'replacements.name': '你的查找替换命令',
  'replacements.desc':
    '每条替换都会成为一个命令“替换：<名称>”，你可以为它设置快捷键，它也会出现在“运行已保存的替换…”中。它作用于所选内容，没有选中内容时作用于整篇笔记，并且绝不会改动代码或 frontmatter。',
  'replacements.nameField': '名称',
  'replacements.nameDesc': '命令名为“替换：<名称>”。没有名称就没有命令。',
  'replacements.namePlaceholder': '修复破折号',
  'replacements.delete': '删除此替换',
  'replacements.find': '查找',
  'replacements.replaceWith': '替换为',
  'replacements.replaceWithDesc': '留空则删除匹配项。开启正则表达式时，$1 表示第一个分组，\\n 表示换行。',
  'replacements.regex': '正则表达式',
  'replacements.matchCase': '区分大小写',
  'replacements.add': '添加替换',
};

export default zh;
