import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { performance } from 'node:perf_hooks';
import { AUTH_COOKIE, isAuthenticated } from '$lib/server/auth';
import { color } from '$lib/server/logcolor';

// Request logging is on unless LOG_REQUESTS is explicitly set to "false"/"0".
const LOG_REQUESTS = env.LOG_REQUESTS !== 'false' && env.LOG_REQUESTS !== '0';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.authenticated = isAuthenticated(event.cookies.get(AUTH_COOKIE));

  // Cover-image requests are high-volume and uninteresting — skip logging them.
  if (!LOG_REQUESTS || event.url.pathname.startsWith('/api/cover')) {
    return resolve(event);
  }

  const startTime = new Date();
  const t0 = performance.now();
  const ts = startTime.toISOString().slice(11, 23); // HH:MM:SS.mmm (UTC)
  const path = `${event.url.pathname}${event.url.search}`;
  const method = color.cyan(event.request.method);
  console.log(`${color.gray(`[REQ ${ts}] -->`)} ${method} ${path}`);

  const response = await resolve(event);

  const ms = performance.now() - t0;
  const durRaw = `${ms.toFixed(1)}ms`;
  const dur = ms > 500 ? color.red(durRaw) : color.dim(durRaw);
  const status =
    response.status >= 500
      ? color.red(response.status)
      : response.status >= 400
        ? color.yellow(response.status)
        : color.green(response.status);
  console.log(`${color.gray(`[REQ ${ts}] <--`)} ${method} ${path} ${status} (${dur})`);
  return response;
};
