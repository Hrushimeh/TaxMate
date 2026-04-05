'use client';

import { useState } from 'react';
import { sanitizeMessagesForUseChat } from '@/lib/messages-ui';
import ChatContainer from './components/ChatContainer';
import ChatSidebar from './components/ChatSidebar';

export default function Home() {
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [listVersion, setListVersion] = useState(0);

  return (
    <main className="flex min-h-screen w-full">
      <ChatSidebar
        activeChatId={chatId}
        refreshTrigger={listVersion}
        onNewChat={() => {
          setChatId(crypto.randomUUID());
          setInitialMessages([]);
        }}
        onChatDeleted={(deletedId) => {
          setListVersion((v) => v + 1);
          if (deletedId === chatId) {
            setChatId(crypto.randomUUID());
            setInitialMessages([]);
          }
        }}
        onSelectChat={async (id) => {
          const res = await fetch(`/api/chats/${id}`);
          if (!res.ok) return;
          const data = await res.json();
          setChatId(id);
          setInitialMessages(sanitizeMessagesForUseChat(data.messages));
        }}
      />
      <div className="flex min-h-screen flex-1 flex-col items-center p-12">
        <ChatContainer
          key={chatId}
          chatId={chatId}
          initialMessages={initialMessages}
          onConversationSaved={() => setListVersion((v) => v + 1)}
        />
      </div>
    </main>
  );
}
