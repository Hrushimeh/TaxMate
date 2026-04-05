'use client';

import { useEffect, useState, type MouseEvent } from 'react';

type ChatSidebarProps = {
  activeChatId: string;
  refreshTrigger: number;
  onNewChat: () => void;
  onChatDeleted?: (id: string) => void;
  onSelectChat: (id: string) => Promise<void>;
};

export default function ChatSidebar({
  activeChatId,
  refreshTrigger,
  onNewChat,
  onChatDeleted,
  onSelectChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<
    { id: string; title: string | null; created_at: string; updated_at: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/chats');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(typeof data.error === 'string' ? data.error : 'Could not load history');
            setChats([]);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setChats(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load history');
          setChats([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  async function handleDeleteChat(id: string, e: MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      onChatDeleted?.(id);
    } catch {
      /* ignore */
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-gray-300 bg-gray-50">
      <div className="border-b border-gray-300 p-4">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading && <p className="px-2 py-2 text-sm text-gray-500">Loading…</p>}
        {error && !loading && <p className="px-2 py-2 text-xs text-amber-800">{error}</p>}
        {!loading && !error && chats.length === 0 && (
          <p className="px-2 py-2 text-sm text-gray-500">No saved chats yet.</p>
        )}
        <ul className="flex flex-col gap-1">
          {chats.map((c) => (
            <li key={c.id}>
              <div
                className={`group flex items-center gap-0 rounded-md transition-colors ${
                  c.id === activeChatId
                    ? 'bg-white shadow-sm ring-1 ring-gray-200'
                    : 'hover:bg-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void onSelectChat(c.id)}
                  className={`min-w-0 flex-1 px-3 py-2 text-left text-sm ${
                    c.id === activeChatId ? 'font-medium text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <span className="line-clamp-2">{c.title?.trim() || 'Untitled chat'}</span>
                </button>
                <button
                  type="button"
                  title="Delete chat"
                  aria-label="Delete chat"
                  onClick={(e) => void handleDeleteChat(c.id, e)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg leading-none text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
