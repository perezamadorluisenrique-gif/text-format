import type { Messages } from '../i18n.ts';

const ja: Messages = {
  // Commands
  'command.upper': '大文字',
  'command.lower': '小文字',
  'command.title': 'タイトルケース',
  'command.sentence': '文頭のみ大文字（センテンスケース）',
  'command.capitalizeWords': '各単語の先頭を大文字にする',
  'command.capitalizeSentences': '各文の先頭を大文字にし、残りはそのままにする',
  'command.cycle': '大文字・小文字を順に切り替え',
  'command.slug': 'スラッグ（小文字、アクセントなし、ハイフン）',
  'command.joinLines': '折り返された行を結合',
  'command.dehyphenate': '行をまたいで分割された単語を結合',
  'command.stripInvisibles': '不可視文字を削除',
  'command.replaceLigatures': '合字を置換',
  'command.straightenPunctuation': '引用符とダッシュをストレートにする',
  'command.removeTrailingWhitespace': '行末の空白を削除',
  'command.collapseSpaces': '連続する空白を1つにまとめる',
  'command.unlink': 'リンクをプレーンテキストに変換',
  'command.sortLines': '行を A から Z の順に並べ替え',
  'command.sortLinesDesc': '行を Z から A の順に並べ替え',
  'command.dedupeLines': '重複する行を削除',
  'command.removeBlankLines': '空行を削除',
  'command.collapseBlankLines': '余分な空行を削除（1行は残す）',
  'command.tidyNote': 'ノートを整形',
  'command.pickCase': '大文字・小文字を変更…',
  'command.runSavedReplacement': '保存した置換を実行…',
  'command.replace': '置換: {name}',

  // Notices
  'notice.nothingToFormat': '整形するものはありません。',
  'notice.nothingToTidy': '整形するものはありません。',
  'notice.noTidySteps': '整形のステップがオンになっていません。設定で選んでください。',
  'notice.noSavedReplacements': '保存した置換はまだありません。プラグインの設定で追加してください。',
  'notice.replacementProblem': '置換: {name}: {problem}',
  'notice.unnamed': '名前なし',
  'notice.skippedInCode': '選択範囲の始まりまたは終わりがコード内にあるため、そのままにしました。',
  'notice.noMatches': '「{name}」に一致するものはありません。',
  'notice.replacements.one': '1 件を置換しました。',
  'notice.replacements.other': '{count} 件を置換しました。',

  // Pickers and the tidy confirmation
  'modal.pickCase': '選択範囲の大文字・小文字を選択',
  'modal.noChange': '変更なし',
  'modal.pickReplacement': '実行する保存済みの置換を選択',
  'modal.noName': '（名前なし）',
  'modal.tidy.line.one': '{step}: 1 行',
  'modal.tidy.line.other': '{step}: {count} 行',
  'modal.tidy.confirm': '整形',
  'modal.tidy.cancel': 'キャンセル',

  // The steps of Tidy note
  'tidy.invisibles': '不可視文字を削除',
  'tidy.ligatures': '合字を置換',
  'tidy.join': '折り返された行を結合',
  'tidy.spaces': '連続する空白を1つにまとめる',
  'tidy.trailing': '行末の空白を削除',
  'tidy.blank': '余分な空行を削除',

  // Why a saved replacement cannot run
  'error.findEmpty': '検索するテキストが空です。',
  'error.invalidRegex': '有効な正規表現ではありません: {reason}',

  // Settings: headings
  'heading.case': '大文字・小文字',
  'heading.cleanup': 'クリーンアップ',
  'heading.tidy': 'ノートを整形',
  'heading.replacements': '保存した置換',

  // Settings: dropdown options
  'option.systemDefault': 'システムのデフォルト',
  'option.turkish': 'トルコ語',
  'option.azerbaijani': 'アゼルバイジャン語',
  'option.lithuanian': 'リトアニア語',
  'option.wholeLine': '行全体',
  'option.wordAtCaret': 'カーソル位置の単語',

  // Settings
  'setting.locale.name': '言語ごとの規則',
  'setting.locale.desc': 'トルコ語とアゼルバイジャン語では、点付きと点なしの i の対応が他の言語と異なります。',
  'setting.preserveAcronyms.name': '頭字語をそのままにする',
  'setting.preserveAcronyms.desc':
    'NASA や PDF などの頭字語、iPhone、macOS、GitHub などの名前をそのままにします。選択範囲全体がすでに大文字の場合は、どの単語も頭字語に見えるため無視されます。',
  'setting.stopWords.name': 'タイトルケースで小文字のままにする単語',
  'setting.stopWords.desc': 'カンマ区切り。タイトルの最初と最後の単語は、このリストにかかわらず常に大文字になります。',
  'setting.removeHyphenOnJoin.name': '行の結合時にハイフンを削除',
  'setting.removeHyphenOnJoin.desc':
    'PDF では単語が "trans-" と "lation" のように分断されます。"well-known" のような本物の複合語のほうが、分断された単語より多いテキストではオフにしてください。',
  'setting.caseTarget.name': '選択がないときに大文字・小文字を変更する対象',
  'setting.caseTarget.desc': '行全体、またはカーソル位置の単語のみ。',
  'setting.tidyInvisibles.name': '不可視文字を削除',
  'setting.tidyInvisibles.desc': 'ゼロ幅文字とソフトハイフンは削除し、ノーブレークスペースは通常の空白にします。',
  'setting.tidyLigatures.name': '合字を置換',
  'setting.tidyLigatures.desc': 'ﬁ と ﬂ を fi と fl にします。',
  'setting.tidyJoin.name': '折り返された行を結合',
  'setting.tidyJoin.desc': '行ごとに強制的に折り返された段落を結合します。行の構造が変わるため、初期設定ではオフです。',
  'setting.tidySpaces.name': '連続する空白を1つにまとめる',
  'setting.tidySpaces.desc': '単語間の連続した空白を1つにします。インデント、表、コードはそのままです。',
  'setting.tidyTrailing.name': '行末の空白を削除',
  'setting.tidyTrailing.desc': '行末のスペースとタブ。',
  'setting.tidyBlank.name': '余分な空行を削除',
  'setting.tidyBlank.desc': '連続する空行を1行にします。',
  'setting.keepHardBreaks.name': '強制改行を残す',
  'setting.keepHardBreaks.desc':
    'Markdown では、テキスト行の末尾にある2つの空白は改行を意味するため、行末の空白の削除では残します。これをオフにすると、それらも削除されます。',
  'setting.confirmTidy.name': '整形前に確認',
  'setting.confirmTidy.desc': '適用する前に、各ステップが変更する行数を表示します。',
  'setting.cleanOnPaste.name': '貼り付け時に整形',
  'setting.cleanOnPaste.desc':
    '貼り付けたプレーンテキストに上のステップを実行します。コードやフロントマターの中では実行せず、書式付きの貼り付けは Obsidian に任せます。初期設定ではオフです。',
  'setting.keepImageAltText.name': '画像の代替テキストを残す',
  'setting.keepImageAltText.desc': '画像をプレーンテキストにするとき、画像を完全に削除せず、その説明を残します。',

  // Settings: saved replacements
  'replacements.name': '独自の検索・置換コマンド',
  'replacements.desc':
    '各置換は「置換: <名前>」というコマンドになり、ホットキーを割り当てられるほか、「保存した置換を実行…」にも一覧表示されます。選択範囲、または選択がないときはノート全体に対して動作し、コードやフロントマターには触れません。',
  'replacements.nameField': '名前',
  'replacements.nameDesc': 'コマンド名は「置換: <名前>」になります。名前がないとコマンドは作られません。',
  'replacements.namePlaceholder': 'ダッシュを修正',
  'replacements.delete': 'この置換を削除',
  'replacements.find': '検索',
  'replacements.replaceWith': '置換後',
  'replacements.replaceWithDesc': '空にすると一致した部分を削除します。正規表現がオンのとき、$1 は最初のグループ、\\n は改行です。',
  'replacements.regex': '正規表現',
  'replacements.matchCase': '大文字・小文字を区別',
  'replacements.add': '置換を追加',
};

export default ja;
