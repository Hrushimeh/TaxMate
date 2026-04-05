function djangoBaseUrl(): string | null {
  const raw = process.env.DJANGO_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function isDjangoBackendConfigured(): boolean {
  return djangoBaseUrl() !== null;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const secret =
    process.env.COTAX_API_SECRET?.trim() || process.env.DJANGO_API_SECRET?.trim();
  if (secret) {
    headers.Authorization = `Bearer ${secret}`;
  }
  return headers;
}

export async function djangoFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = djangoBaseUrl();
  if (!base) {
    throw new Error("DJANGO_API_URL is not set");
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string>),
    },
  });
}
