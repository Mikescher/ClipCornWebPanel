import { createHash, timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';

/** Name of the httpOnly session cookie holding the auth token. */
export const AUTH_COOKIE = 'cc_auth';

/** The shared password, configured via the PANEL_PASSWORD environment variable. */
function configuredPassword(): string {
  return env.PANEL_PASSWORD ?? '';
}

/** Derive the opaque session token stored in the cookie from a password. */
function tokenFor(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/** The token a valid cookie must contain, or null when auth is disabled (no password set). */
function expectedToken(): string | null {
  const pw = configuredPassword();
  return pw ? tokenFor(pw) : null;
}

/**
 * Validate a submitted password. Returns the session token to store in the cookie,
 * or null if the password is wrong or auth is disabled.
 */
export function login(password: string): string | null {
  const pw = configuredPassword();
  if (!pw || !password) return null;
  const a = Buffer.from(password);
  const b = Buffer.from(pw);
  if (a.length === b.length && timingSafeEqual(a, b)) {
    return tokenFor(pw);
  }
  return null;
}

/** Check whether a cookie token corresponds to the configured password. */
export function isAuthenticated(token: string | undefined): boolean {
  const expected = expectedToken();
  if (!expected || !token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
