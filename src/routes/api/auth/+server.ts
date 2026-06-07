import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH_COOKIE, login } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  let password = '';
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    throw error(400, 'Invalid request');
  }

  const token = login(password);
  if (!token) {
    throw error(401, 'Invalid password');
  }

  cookies.set(AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: '/' });
  return json({ ok: true });
};
