export async function hasDashboardAccess(): Promise<boolean> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  if (!apiBase) return false;

  const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

  try {
    const response = await fetch(`${normalizedBase}/api/auth/dashboard-access`, {
      credentials: 'include',
    });

    return response.ok;
  } catch {
    return false;
  }
}
