/**
 * useChat / Vercel AI SDK expects each message to have a proper `parts` array.
 * Data from the API (or bad `.map` targets like non-array toolInvocations) can
 * crash the SDK with a minified error such as "e[o] is not a function".
 * We only pass id, role, and parts so nothing tries to call .map on the wrong type.
 */
export function sanitizeMessagesForUseChat(messages: unknown): any[] {
  if (!Array.isArray(messages)) return [];

  return messages.map((m: any) => {
    if (!m || typeof m !== 'object') {
      return {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: '' }],
      };
    }

    const id = typeof m.id === 'string' ? m.id : crypto.randomUUID();
    const role = m.role === 'assistant' || m.role === 'user' || m.role === 'system' ? m.role : 'user';

    let parts: any[];
    if (Array.isArray(m.parts)) {
      parts = m.parts;
    } else if (typeof m.content === 'string') {
      parts = [{ type: 'text', text: m.content }];
    } else {
      parts = [{ type: 'text', text: '' }];
    }

    return { id, role, parts };
  });
}
