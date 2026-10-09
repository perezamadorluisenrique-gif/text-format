/**
 * Saved find-and-replace: the pure logic behind the "Replace: <name>"
 * commands.
 *
 * Nothing here imports `obsidian`, so it runs under plain Node. A replacement
 * works line by line over the prose of a text: fenced code, inline code and
 * display maths are copied through untouched, exactly as for the other
 * commands (see `eachProseSegment`), so a match never spans a line break.
 */

import { eachProseSegment } from './cleanup.ts';

export interface SavedReplacement {
  /** Stable key behind the command id, so a hotkey survives a rename. */
  id: string;
  name: string;
  find: string;
  replace: string;
  /** `find` is a regular expression and `replace` may use `$1` groups. */
  regex: boolean;
  matchCase: boolean;
}

export interface ReplaceResult {
  text: string;
  /** Matches that actually changed something. */
  count: number;
}

/** A pattern is compiled with `u` when it can be, so `\p{L}` works, and without it otherwise. */
function compile(source: string, flags: string): RegExp {
  try {
    return new RegExp(source, flags + 'u');
  } catch {
    return new RegExp(source, flags);
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The regular expression a replacement searches with, or an error message. */
export function buildPattern(r: Pick<SavedReplacement, 'find' | 'regex' | 'matchCase'>): RegExp | string {
  if (r.find === '') return 'Find text is empty.';
  const flags = r.matchCase ? 'g' : 'gi';

  try {
    return compile(r.regex ? r.find : escapeRegExp(r.find), flags);
  } catch (error) {
    const reason = error instanceof Error ? error.message.replace(/^Invalid regular expression:\s*/, '') : 'invalid';
    return `Not a valid regular expression: ${reason}`;
  }
}

/** Why a replacement cannot run, or null when it can. */
export function replacementError(r: SavedReplacement): string | null {
  const pattern = buildPattern(r);
  return typeof pattern === 'string' ? pattern : null;
}

/**
 * The replacement text for one match: `$1`..`$99`, `$&`, `$<name>`, `$$`
 * and `\n`, `\t`, `\\`. A group that does not exist stays as typed.
 */
function expand(template: string, match: string[], groups: Record<string, string | undefined> | undefined): string {
  let out = '';

  for (let i = 0; i < template.length; i++) {
    const ch = template[i];

    if (ch === '\\' && i + 1 < template.length) {
      const next = template[i + 1];
      if (next === 'n') { out += '\n'; i++; continue; }
      if (next === 't') { out += '\t'; i++; continue; }
      if (next === '\\') { out += '\\'; i++; continue; }
    }

    if (ch === '$' && i + 1 < template.length) {
      const next = template[i + 1];
      if (next === '$') { out += '$'; i++; continue; }
      if (next === '&') { out += match[0]; i++; continue; }

      const digits = /^\d{1,2}/.exec(template.slice(i + 1));
      if (digits) {
        // `$12` is group 12 when there is one, else group 1 followed by "2".
        const two = Number(digits[0]);
        const one = Number(digits[0][0]);
        if (digits[0].length === 2 && two >= 1 && two < match.length) {
          out += match[two] ?? '';
          i += 2;
          continue;
        }
        if (one >= 1 && one < match.length) {
          out += match[one] ?? '';
          i += 1;
          continue;
        }
      }

      const named = /^<([^>]+)>/.exec(template.slice(i + 1));
      if (named && groups !== undefined && named[1] in groups) {
        out += groups[named[1]] ?? '';
        i += named[0].length;
        continue;
      }
    }

    out += ch;
  }

  return out;
}

/**
 * Runs one saved replacement over `text`.
 *
 * Throws nothing: an unusable replacement (empty find text, invalid regular
 * expression) comes back as `{ error }` and leaves the text as it was. A
 * plain-text replacement inserts its replace text as typed; only a regular
 * expression reads `$1` and `\n`.
 */
export function runReplacement(text: string, r: SavedReplacement): ReplaceResult & { error?: string } {
  const pattern = buildPattern(r);
  if (typeof pattern === 'string') return { text, count: 0, error: pattern };

  let count = 0;
  const result = eachProseSegment(text, (segment) =>
    segment.replace(pattern, (...args: unknown[]) => {
      const last = args[args.length - 1];
      const hasGroups = typeof last === 'object' && last !== null;
      const captures = args.slice(0, hasGroups ? -3 : -2) as string[];
      const groups = hasGroups ? (last as Record<string, string | undefined>) : undefined;

      const replacement = r.regex ? expand(r.replace, captures, groups) : r.replace;
      if (replacement !== captures[0]) count++;
      return replacement;
    }));

  return { text: result, count };
}

/** Coerces whatever `data.json` holds into a clean list; bad entries are dropped. */
export function normalizeReplacements(stored: unknown): SavedReplacement[] {
  if (!Array.isArray(stored)) return [];

  const seen = new Set<string>();
  const list: SavedReplacement[] = [];

  for (const item of stored as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== 'string' || raw.id === '' || seen.has(raw.id)) continue;

    seen.add(raw.id);
    list.push({
      id: raw.id,
      name: typeof raw.name === 'string' ? raw.name : '',
      find: typeof raw.find === 'string' ? raw.find : '',
      replace: typeof raw.replace === 'string' ? raw.replace : '',
      regex: raw.regex === true,
      matchCase: raw.matchCase === true,
    });
  }

  return list;
}

/** An id not used by `existing`: lowercase letters and digits, safe in a command id. */
export function newReplacementId(existing: readonly SavedReplacement[], random: () => number = Math.random): string {
  const used = new Set(existing.map((r) => r.id));
  const size = 36 ** 6;
  let n = Math.floor(random() * size) % size;

  // Step on from a collision instead of drawing again, so it ends even when `random` is stuck.
  while (used.has(n.toString(36).padStart(6, '0'))) n = (n + 1) % size;
  return n.toString(36).padStart(6, '0');
}

/** The command name for a replacement; the host adds the plugin name in front. */
export function replacementCommandName(r: SavedReplacement): string {
  return `Replace: ${r.name.trim()}`;
}
