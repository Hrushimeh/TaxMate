import { randomUUID } from 'crypto';
import { djangoFetch, isDjangoBackendConfigured } from './django-api';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidChatId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id);
}

export function deriveTitleFromMessages(messages: any[]): string | null {
  const firstUser = messages.find((m: any) => m && m.role === 'user');
  if (!firstUser || !Array.isArray(firstUser.parts)) return null;
  const text = firstUser.parts
    .filter((p: any) => p.type === 'text' && p.text)
    .map((p: any) => p.text)
    .join(' ')
    .trim();
  if (!text) return null;
  const shortened = text.replace(/\s+/g, ' ').slice(0, 80);
  return shortened.length < text.length ? `${shortened}…` : shortened;
}

export async function upsertChat(
  chatId: string,
  messages: any[],
  title: string | null
): Promise<void> {
  if (!isDjangoBackendConfigured()) return;

  const res = await djangoFetch(`/api/chats/${chatId}/`, {
    method: 'PUT',
    body: JSON.stringify({
      messages,
      title: title ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Django upsert failed: ${res.status} ${text}`);
  }
}

export async function listChats() {
  if (!isDjangoBackendConfigured()) return [];

  const res = await djangoFetch('/api/chats/', { method: 'GET' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Django list failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((r: any) => ({
    id: r.id,
    title: r.title,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function deleteChat(chatId: string): Promise<void> {
  if (!isDjangoBackendConfigured()) return;

  const res = await djangoFetch(`/api/chats/${chatId}/`, { method: 'DELETE' });
  if (res.status === 404) {
    return;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Django delete failed: ${res.status} ${text}`);
  }
}

export async function getChat(chatId: string) {
  if (!isDjangoBackendConfigured()) return null;

  const res = await djangoFetch(`/api/chats/${chatId}/`, { method: 'GET' });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Django get failed: ${res.status} ${text}`);
  }

  const r = await res.json();
  return {
    id: r.id,
    title: r.title,
    messages: Array.isArray(r.messages) ? r.messages : [],
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function newAssistantMessage(text: string) {
  return {
    id: randomUUID(),
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text }],
  };
}
