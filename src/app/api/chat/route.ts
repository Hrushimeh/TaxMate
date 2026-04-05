import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  deriveTitleFromMessages,
  isValidChatId,
  newAssistantMessage,
  upsertChat,
} from '@/lib/chats';
import { isDjangoBackendConfigured } from '@/lib/django-api';

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const chatId = body.chatId;

  const persist = isDjangoBackendConfigured() && isValidChatId(chatId);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system:
      "do not respond on markdown or lists, keep your responses brief, you can ask the user to upload images or documents if it could help you understand the problem better. you should act as a tax assistant, helping users with basic questions about individual tax returns (Form 1040)",
    messages,
    maxTokens: 300,
    onFinish: persist
      ? async ({ text }) => {
          try {
            const assistantMsg = newAssistantMessage(text);
            const snapshot = [...messages, assistantMsg];
            const title = deriveTitleFromMessages(messages);
            await upsertChat(chatId, snapshot, title);
          } catch (e) {
            console.error('[chat persist]', e);
          }
        }
      : undefined,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}

function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}