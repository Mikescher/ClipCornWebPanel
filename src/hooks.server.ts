import type { Handle } from '@sveltejs/kit';
import { AUTH_COOKIE, isAuthenticated } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.authenticated = isAuthenticated(event.cookies.get(AUTH_COOKIE));
  return resolve(event);
};
