import { NextResponse } from 'next/server';
import { listChats } from '@/lib/chats';
import { isDjangoBackendConfigured } from '@/lib/django-api';

export async function GET() {
  if (!isDjangoBackendConfigured()) {
    return NextResponse.json(
      { error: 'Backend not configured. Set DJANGO_API_URL in .env.local (Django API base URL).' },
      { status: 503 }
    );
  }

  try {
    const chats = await listChats();
    return NextResponse.json(chats);
  } catch (e) {
    console.error('[GET /api/chats]', e);
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 });
  }
}
