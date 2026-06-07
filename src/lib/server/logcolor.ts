// Tiny ANSI color helper for server logs. Colors are only emitted when stdout is a
// TTY (and NO_COLOR is not set), so piped/redirected output stays clean.
const enabled = !!process.stdout.isTTY && process.env.NO_COLOR === undefined;

function wrap(code: number): (s: string | number) => string {
  return (s) => (enabled ? `\x1b[${code}m${s}\x1b[0m` : String(s));
}

export const color = {
  enabled,
  dim: wrap(2),
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  cyan: wrap(36),
  gray: wrap(90)
};
