/**
 * Wrapper around fetch for the API (Vite proxies /api to the backend in dev).
 */
export function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function api(path, options = {}) {
  const headers = {
    ...authHeaders({ 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.assign('/login');
    throw new Error('Session expired.');
  }

  return res;
}

export async function parseJsonOrEmpty(res) {
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
