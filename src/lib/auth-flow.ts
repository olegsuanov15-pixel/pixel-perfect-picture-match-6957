import { initialProfileMode } from './profile-view';

export const AUTH_RETURN_KEY = 'ironkarta-auth-return';
export const OAUTH_PENDING_KEY = 'ironkarta-oauth-pending';

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return '/';
  try {
    const url = new URL(value, 'https://ironkarta.local');
    if (url.origin !== 'https://ironkarta.local' || ['/auth', '/register', '/forgot-password', '/reset-password'].includes(url.pathname)) return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return '/'; }
}

export function destinationAfterLogin(profile: Parameters<typeof initialProfileMode>[0], returnTo: unknown) {
  return initialProfileMode(profile) === 'edit' ? '/profile' : safeReturnPath(returnTo);
}

export function googleDisplayName(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.['full_name'] ?? metadata?.['name'];
  return typeof value === 'string' ? value.trim().slice(0, 80) : '';
}