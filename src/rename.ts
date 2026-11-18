/**
 * Building a file's new name in another case, and the checks that make a
 * rename safe on every platform a vault syncs to. Pure: Obsidian does the
 * rename itself (`fileManager.renameFile`, which also updates the links).
 */

/** The cases offered for a name, most used first. Ids of commands in `COMMANDS`. */
export const NAMING_CASES: readonly string[] = [
  'title',
  'sentence',
  'capitalize-words',
  'lower',
  'kebab-case',
  'slug',
  'snake-case',
  'camel-case',
  'pascal-case',
];

export interface SplitPath {
  /** The folder with a trailing slash, or '' at the vault root. */
  folder: string;
  basename: string;
  /** With its dot, or '' when there is none. */
  extension: string;
}

export function splitPath(path: string): SplitPath {
  const slash = path.lastIndexOf('/');
  const folder = slash === -1 ? '' : path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  const dot = name.lastIndexOf('.');
  // A name that starts with its only dot has no extension.
  if (dot <= 0) return { folder, basename: name, extension: '' };
  return { folder, basename: name.slice(0, dot), extension: name.slice(dot) };
}

/** Characters Windows forbids in a name, and so Android's shared storage and most sync services. */
const FORBIDDEN = /[<>:"/\\|?*]/g;

// eslint-disable-next-line no-control-regex -- control characters are exactly what this looks for.
const CONTROL = /[\u0000-\u001f\u007f]/;

/** Names Windows keeps for devices, with or without an extension. */
const RESERVED = /^(con|prn|aux|nul|com[0-9¹²³]|lpt[0-9¹²³])$/i;

/** The longest name most file systems accept, in UTF-8 bytes. */
export const MAX_NAME_BYTES = 255;

export type NameProblem =
  | { kind: 'empty' }
  | { kind: 'forbidden'; chars: string }
  | { kind: 'control' }
  | { kind: 'reserved' }
  | { kind: 'trailing' }
  | { kind: 'leadingDot' }
  | { kind: 'tooLong' };

/** Why `basename` + `extension` cannot be a file name on some platform, or null when it can. */
export function nameProblem(basename: string, extension = ''): NameProblem | null {
  if (basename.trim() === '') return { kind: 'empty' };
  const forbidden = basename.match(FORBIDDEN);
  if (forbidden !== null) return { kind: 'forbidden', chars: [...new Set(forbidden)].join(' ') };
  if (CONTROL.test(basename)) return { kind: 'control' };
  if (RESERVED.test(basename.split('.')[0].trim())) return { kind: 'reserved' };
  if (/[. ]$/.test(basename)) return { kind: 'trailing' };
  // Obsidian hides files whose name starts with a dot.
  if (basename.startsWith('.')) return { kind: 'leadingDot' };
  if (new TextEncoder().encode(basename + extension).length > MAX_NAME_BYTES) return { kind: 'tooLong' };
  return null;
}

export type RenamePlan =
  | { ok: true; path: string; name: string }
  | { ok: false; reason: 'unchanged' | 'taken'; name: string }
  | { ok: false; reason: 'invalid'; name: string; problem: NameProblem };

/**
 * The rename that `convert` makes of the file at `path`: only the base name
 * changes, never the folder or the extension.
 *
 * `existing` is every path in the vault. A name that differs only in case from
 * another file in the same folder is taken too, because Windows and macOS
 * cannot keep both. The file's own path does not count, so changing only the
 * case of a name is allowed.
 */
export function planRename(path: string, convert: (basename: string) => string, existing: Iterable<string>): RenamePlan {
  const { folder, basename, extension } = splitPath(path);
  const next = convert(basename).replace(/\s*\n\s*/g, ' ').trim();
  const name = next + extension;

  if (next === basename) return { ok: false, reason: 'unchanged', name };

  const problem = nameProblem(next, extension);
  if (problem !== null) return { ok: false, reason: 'invalid', name, problem };

  const target = folder + name;
  const wanted = target.toLowerCase();
  for (const other of existing) {
    if (other !== path && other.toLowerCase() === wanted) return { ok: false, reason: 'taken', name };
  }
  return { ok: true, path: target, name };
}
