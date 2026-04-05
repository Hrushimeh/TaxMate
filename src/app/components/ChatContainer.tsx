'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { sanitizeMessagesForUseChat } from '@/lib/messages-ui';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import FileUploadPreview from './FileUploadPreview';
import ChatSuggestions from './ChatSuggestions';

export default function ChatContainer({
  chatId,
  initialMessages = [],
  onConversationSaved,
}: {
  chatId: string;
  initialMessages?: any[];
  onConversationSaved?: () => void;
}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat({
    id: chatId,
    api: '/api/chat',
    initialMessages: sanitizeMessagesForUseChat(initialMessages),
    body: { chatId },
    onFinish: () => {
      onConversationSaved?.();
    },
    onResponse: async (_response) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setSuggestions([]);
    },
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null!);
  const messagesEndRef = useRef<HTMLDivElement>(null!);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (status === 'ready') {
      setLoading(false);
    }
  }, [status]);

  const fetchSuggestions = async (latestAIMessage: any) => {
    try {
      const suggestionsResponse = await fetch('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, latestAIMessage].map((m) => ({
            role: m.role,
            content: (Array.isArray(m.parts) ? m.parts : [])
              .map((p: any) => (p.type === 'text' ? p.text : ''))
              .join(' '),
          })),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const newSuggestions = await suggestionsResponse.json();
      setSuggestions(Array.isArray(newSuggestions) ? newSuggestions : []);
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
    }
  };

  useEffect(() => {
    if (status === 'ready') {
      const latestAIMessage = messages.filter((m) => m.role === 'assistant').pop();
      if (latestAIMessage) {
        const parts = Array.isArray(latestAIMessage.parts) ? latestAIMessage.parts : [];
        const isMessageComplete = parts.every((part: any) => part.type === 'text');
        if (isMessageComplete) {
          fetchSuggestions(latestAIMessage);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- suggestions should run when history / status changes
  }, [status, messages]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) =>
          file.type.startsWith("image/") ||
          file.type.startsWith("text/") ||
          file.type == "application/pdf"
      );
      if (validFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      }
    }
  };

  const handleRemoveFile = (fileNameToRemove: string) => {
    if (files) {
      const remainingFiles = Array.from(files).filter((file) => file.name !== fileNameToRemove);
      if (remainingFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        remainingFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        setFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSendMessage = (event: React.FormEvent, additionalOptions = {}) => {
    setLoading(true);
    event.preventDefault();
    const options = files ? { experimental_attachments: files } : additionalOptions;
    handleSubmit(event, options);
    setFiles(null);
  };

  return (
    <div className="flex flex-col w-full px-20 p-6">
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      <ChatInput
        input={input}
        loading={loading}
        fileInputRef={fileInputRef}
        handleInputChange={handleInputChange}
        handleUploadClick={handleUploadClick}
        handleFileChange={handleFileChange}
        handleSendMessage={handleSendMessage}
      />

      {files && files.length > 0 && (
        <FileUploadPreview
          files={files}
          onRemoveFile={handleRemoveFile}
        />
      )}

      {suggestions.length > 0 && (
        <ChatSuggestions
          suggestions={suggestions}
          handleInputChange={handleInputChange}
          handleSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
