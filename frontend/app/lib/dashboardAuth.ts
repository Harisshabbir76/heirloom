export async function hasDashboardAccess(): Promise<{ allowed: boolean; error?: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  if (!apiBase) return { allowed: false, error: 'Missing NEXT_PUBLIC_API_URL' };

  const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

  try {
    const response = await fetch(`${normalizedBase}/api/auth/dashboard-access`, {
      credentials: 'include',
    });

    if (response.ok) {
      return { allowed: true };
    }

    // Read error message for debugging
    let errorMsg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch { /* ignore */ }

    return { allowed: false, error: errorMsg };
  } catch (err) {
    return { allowed: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
