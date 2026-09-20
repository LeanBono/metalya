import { NextResponse } from 'next/server';
import { tryLogin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || '');
    const username = body.username ? String(body.username) : undefined;
    const ok = await tryLogin(password, username);
    if (!ok) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error de login' }, { status: 400 });
  }
}
