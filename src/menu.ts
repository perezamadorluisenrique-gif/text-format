/**
 * What the editor's context menu offers: two short lists, "Text case" and
 * "Cleanup", each pointing at commands that already exist. Pure, so the order
 * and the rules for leaving items out are tested without Obsidian.
 *
 * An entry is a command id, or `'separator'`. Two ids are not commands of their
 * own in the `COMMANDS` table: `pick-case` opens the case picker and `tidy-note`
 * runs Tidy note with its confirmation.
 */
export type MenuEntry = string;

export const SEPARATOR = 'separator';

/** Most used first; everything else is one step away in "Change case…". */
export const CASE_MENU: readonly MenuEntry[] = [
  'upper',
  'lower',
  'title',
  'sentence',
  'capitalize-words',
  'slug',
  SEPARATOR,
  'pick-case',
];

/** Text clean-ups first, then the commands that work on whole lines. */
export const CLEANUP_MENU: readonly MenuEntry[] = [
  'tidy-note',
  'join-lines',
  'strip-invisibles',
  'straighten-punctuation',
  'unlink',
  SEPARATOR,
  'sort-lines',
  'dedupe-lines',
  'collapse-blank-lines',
];

/**
 * Commands that cannot do anything without a selection: with only a caret they
 * work on the current line, and one line has nothing to join.
 */
export const NEEDS_SELECTION: ReadonlySet<string> = new Set(['join-lines', 'dehyphenate']);

export interface MenuGroup {
  id: 'case' | 'cleanup';
  entries: MenuEntry[];
}

export interface EditorMenuModel {
  /**
   * `submenu`: one menu item per group, opening a submenu (desktop).
   * `picker`: one menu item per group, opening a searchable list. Obsidian's
   * mobile menu is a sheet without real submenus, so mobile, and any app whose
   * menu items have no `setSubmenu`, gets this.
   */
  mode: 'submenu' | 'picker';
  groups: MenuGroup[];
}

/** Drops leading, trailing and repeated separators. */
export function tidySeparators(entries: readonly MenuEntry[]): MenuEntry[] {
  const out: MenuEntry[] = [];
  for (const entry of entries) {
    if (entry === SEPARATOR && (out.length === 0 || out[out.length - 1] === SEPARATOR)) continue;
    out.push(entry);
  }
  while (out.length > 0 && out[out.length - 1] === SEPARATOR) out.pop();
  return out;
}

export function editorMenuModel(options: { enabled: boolean; hasSelection: boolean; submenus: boolean }): EditorMenuModel | null {
  if (!options.enabled) return null;

  const keep = (entry: MenuEntry): boolean => options.hasSelection || !NEEDS_SELECTION.has(entry);
  const mode = options.submenus ? 'submenu' : 'picker';
  const groups: MenuGroup[] = [
    { id: 'case', entries: tidySeparators(CASE_MENU.filter(keep)) },
    { id: 'cleanup', entries: tidySeparators(CLEANUP_MENU.filter(keep)) },
  ];

  // A picker is its own list, so it has no separators, and the case picker
  // already lists every case.
  if (mode === 'picker') {
    for (const group of groups) group.entries = group.entries.filter((entry) => entry !== SEPARATOR && entry !== 'pick-case');
  }
  return { mode, groups: groups.filter((group) => group.entries.length > 0) };
}

/**
 * True when menu items can open submenus here. `setSubmenu` is not in the
 * public typings, so it is looked for at run time rather than assumed.
 */
export function canUseSubmenus(isMobile: boolean, item: unknown): boolean {
  if (isMobile) return false;
  return typeof (item as { setSubmenu?: unknown } | null)?.setSubmenu === 'function';
}
