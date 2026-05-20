export function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)')); // cookie name must match backend
  return match ? decodeURIComponent(match[2]) : null;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function clearAuthCookieClient() {
  if (typeof document === 'undefined') return;
  document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
}

