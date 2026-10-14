import type { Messages } from '../i18n.ts';

const ko: Messages = {
  // Commands
  'command.upper': '대문자',
  'command.lower': '소문자',
  'command.title': '제목 형식 대소문자',
  'command.sentence': '문장 형식 대소문자',
  'command.capitalizeWords': '각 단어의 첫 글자를 대문자로',
  'command.capitalizeSentences': '문장의 첫 글자만 대문자로(나머지는 유지)',
  'command.cycle': '대소문자 순환',
  'command.slug': '슬러그(소문자, 악센트 제거, 하이픈)',
  'command.joinLines': '줄바꿈된 줄 합치기',
  'command.dehyphenate': '줄 끝에서 나뉜 단어 다시 잇기',
  'command.stripInvisibles': '보이지 않는 문자 제거',
  'command.replaceLigatures': '합자 바꾸기',
  'command.straightenPunctuation': '따옴표와 대시를 곧게 바꾸기',
  'command.removeTrailingWhitespace': '줄 끝 공백 제거',
  'command.collapseSpaces': '여러 공백 합치기',
  'command.unlink': '링크를 일반 텍스트로',
  'command.sortLines': '줄을 A부터 Z로 정렬',
  'command.sortLinesDesc': '줄을 Z부터 A로 정렬',
  'command.dedupeLines': '중복된 줄 제거',
  'command.removeBlankLines': '빈 줄 제거',
  'command.collapseBlankLines': '불필요한 빈 줄 제거(하나는 유지)',
  'command.tidyNote': '노트 정리',
  'command.pickCase': '대소문자 변경…',
  'command.runSavedReplacement': '저장된 바꾸기 실행…',
  'command.replace': '바꾸기: {name}',

  // Notices
  'notice.nothingToFormat': '서식을 바꿀 내용이 없습니다.',
  'notice.nothingToTidy': '정리할 내용이 없습니다.',
  'notice.noTidySteps': '켜져 있는 정리 단계가 없습니다. 설정에서 선택하세요.',
  'notice.noSavedReplacements': '저장된 바꾸기가 아직 없습니다. 플러그인 설정에서 추가하세요.',
  'notice.replacementProblem': '바꾸기: {name}: {problem}',
  'notice.unnamed': '이름 없음',
  'notice.skippedInCode': '선택 영역이 코드 안에서 시작하거나 끝나므로 그대로 두었습니다.',
  'notice.noMatches': '"{name}"에 일치하는 항목이 없습니다.',
  'notice.replacements.one': '1건을 바꿨습니다.',
  'notice.replacements.other': '{count}건을 바꿨습니다.',

  // Pickers and the tidy confirmation
  'modal.pickCase': '선택 영역에 적용할 대소문자를 고르세요',
  'modal.noChange': '변경 없음',
  'modal.pickReplacement': '실행할 저장된 바꾸기를 고르세요',
  'modal.noName': '(이름 없음)',
  'modal.tidy.line.one': '{step}: 1줄',
  'modal.tidy.line.other': '{step}: {count}줄',
  'modal.tidy.confirm': '정리',
  'modal.tidy.cancel': '취소',

  // The steps of Tidy note
  'tidy.invisibles': '보이지 않는 문자 제거',
  'tidy.ligatures': '합자 바꾸기',
  'tidy.join': '줄바꿈된 줄 합치기',
  'tidy.spaces': '여러 공백 합치기',
  'tidy.trailing': '줄 끝 공백 제거',
  'tidy.blank': '불필요한 빈 줄 제거',

  // Why a saved replacement cannot run
  'error.findEmpty': '찾을 텍스트가 비어 있습니다.',
  'error.invalidRegex': '올바른 정규식이 아닙니다: {reason}',

  // Settings: headings
  'heading.case': '대소문자',
  'heading.cleanup': '정리',
  'heading.tidy': '노트 정리',
  'heading.replacements': '저장된 바꾸기',

  // Settings: dropdown options
  'option.systemDefault': '시스템 기본값',
  'option.turkish': '튀르키예어',
  'option.azerbaijani': '아제르바이잔어',
  'option.lithuanian': '리투아니아어',
  'option.wholeLine': '줄 전체',
  'option.wordAtCaret': '커서 위치의 단어',

  // Settings
  'setting.locale.name': '언어별 규칙',
  'setting.locale.desc': '튀르키예어와 아제르바이잔어는 점이 있는 i와 없는 i의 대응이 다른 모든 언어와 다릅니다.',
  'setting.preserveAcronyms.name': '약어 그대로 두기',
  'setting.preserveAcronyms.desc':
    'NASA, PDF 같은 약어와 iPhone, macOS, GitHub 같은 이름을 그대로 둡니다. 선택 영역 전체가 이미 대문자이면 모든 단어가 약어처럼 보이므로 무시됩니다.',
  'setting.stopWords.name': '제목 형식에서 소문자로 유지할 단어',
  'setting.stopWords.desc': '쉼표로 구분합니다. 이 목록과 관계없이 제목의 첫 단어와 마지막 단어는 항상 대문자로 씁니다.',
  'setting.removeHyphenOnJoin.name': '줄을 합칠 때 하이픈 제거',
  'setting.removeHyphenOnJoin.desc':
    'PDF는 단어를 "trans-"와 "lation"처럼 끊습니다. "well-known" 같은 실제 복합어가 끊어진 단어보다 많은 글에서는 이 옵션을 끄세요.',
  'setting.caseTarget.name': '선택 영역이 없을 때 대소문자를 바꿀 대상',
  'setting.caseTarget.desc': '줄 전체, 또는 커서 위치의 단어만.',
  'setting.tidyInvisibles.name': '보이지 않는 문자 제거',
  'setting.tidyInvisibles.desc': '너비가 없는 문자와 소프트 하이픈은 제거하고, 줄바꿈 없는 공백은 일반 공백으로 바꿉니다.',
  'setting.tidyLigatures.name': '합자 바꾸기',
  'setting.tidyLigatures.desc': 'ﬁ와 ﬂ를 fi와 fl로 바꿉니다.',
  'setting.tidyJoin.name': '줄바꿈된 줄 합치기',
  'setting.tidyJoin.desc': '여러 줄로 강제 줄바꿈된 문단을 합칩니다. 줄 구조를 바꾸므로 기본값은 꺼짐입니다.',
  'setting.tidySpaces.name': '여러 공백 합치기',
  'setting.tidySpaces.desc': '단어 사이에 연속된 공백을 하나로 만듭니다. 들여쓰기, 표, 코드는 그대로 둡니다.',
  'setting.tidyTrailing.name': '줄 끝 공백 제거',
  'setting.tidyTrailing.desc': '줄 끝의 공백과 탭.',
  'setting.tidyBlank.name': '불필요한 빈 줄 제거',
  'setting.tidyBlank.desc': '연속된 빈 줄을 하나로 만듭니다.',
  'setting.keepHardBreaks.name': '강제 줄바꿈 유지',
  'setting.keepHardBreaks.desc':
    '마크다운에서는 텍스트 줄 끝의 공백 두 개가 줄바꿈이므로, 줄 끝 공백 제거 시 이를 유지합니다. 이 옵션을 끄면 그것도 제거합니다.',
  'setting.confirmTidy.name': '정리하기 전에 확인',
  'setting.confirmTidy.desc': '적용하기 전에 각 단계가 바꿀 줄 수를 보여 줍니다.',
  'setting.cleanOnPaste.name': '붙여넣을 때 정리',
  'setting.cleanOnPaste.desc':
    '붙여넣은 일반 텍스트에 위 단계를 실행합니다. 코드나 프론트매터 안에서는 실행하지 않으며, 서식이 있는 붙여넣기는 Obsidian이 처리하도록 둡니다. 기본값은 꺼짐입니다.',
  'setting.keepImageAltText.name': '이미지 대체 텍스트 유지',
  'setting.keepImageAltText.desc': '이미지를 일반 텍스트로 바꿀 때 이미지를 통째로 지우지 않고 설명을 남깁니다.',

  // Settings: saved replacements
  'replacements.name': '나만의 찾아 바꾸기 명령',
  'replacements.desc':
    '각 바꾸기는 단축키를 지정할 수 있는 "바꾸기: <이름>" 명령이 되며, "저장된 바꾸기 실행…"에도 나열됩니다. 선택 영역에, 선택 영역이 없으면 노트 전체에 적용되고 코드나 프론트매터는 건드리지 않습니다.',
  'replacements.nameField': '이름',
  'replacements.nameDesc': '명령 이름은 "바꾸기: <이름>"이 됩니다. 이름이 없으면 명령도 없습니다.',
  'replacements.namePlaceholder': '대시 고치기',
  'replacements.delete': '이 바꾸기 삭제',
  'replacements.find': '찾기',
  'replacements.replaceWith': '바꿀 내용',
  'replacements.replaceWithDesc': '비워 두면 일치한 부분을 삭제합니다. 정규식을 켜면 $1은 첫 번째 그룹, \\n은 줄바꿈입니다.',
  'replacements.regex': '정규식',
  'replacements.matchCase': '대소문자 구분',
  'replacements.add': '바꾸기 추가',
};

export default ko;
