import { NextResponse } from 'next/server';
import { deleteChat, getChat, isValidChatId } from '@/lib/chats';
import { isDjangoBackendConfigured } from '@/lib/django-api';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidChatId(id)) {
    return NextResponse.json({ error: 'Invalid chat id' }, { status: 400 });
  }

  if (!isDjangoBackendConfigured()) {
    return NextResponse.json(
      { error: 'Backend not configured. Set DJANGO_API_URL in .env.local (Django API base URL).' },
      { status: 503 }
    );
  }

  try {
    const chat = await getChat(id);
    if (!chat) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(chat);
  } catch (e) {
    console.error('GET /api/chats/[id]', e);
    return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidChatId(id)) {
    return NextResponse.json({ error: 'Invalid chat id' }, { status: 400 });
  }

  if (!isDjangoBackendConfigured()) {
    return NextResponse.json(
      { error: 'Backend not configured. Set DJANGO_API_URL in .env.local (Django API base URL).' },
      { status: 503 }
    );
  }

  try {
    await deleteChat(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/chats/[id]', e);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
