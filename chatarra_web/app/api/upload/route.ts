import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 6;

/**
 * Subida de fotos del lote.
 * - Si existe BLOB_READ_WRITE_TOKEN (Vercel Blob), sube a storage persistente.
 * - Si no, guarda en public/uploads (solo desarrollo / VPS con disco).
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const leadId = String(form.get('leadId') || '');
    if (!leadId) return NextResponse.json({ error: 'Falta leadId' }, { status: 400 });

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { lots: true },
    });
    if (!lead?.lots[0]) {
      return NextResponse.json({ error: 'Solicitud inexistente' }, { status: 404 });
    }

    const files = form.getAll('photos').filter((x) => x instanceof File) as File[];
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: 'Maximo 6 fotos.' }, { status: 400 });
    }

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type) || file.size > MAX_BYTES) continue;

      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const name = `${randomUUID()}.${ext}`;
      let url: string;

      if (useBlob) {
        const { put } = await import('@vercel/blob');
        const blob = await put(`uploads/${name}`, file, {
          access: 'public',
          contentType: file.type,
        });
        url = blob.url;
      } else {
        const dir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
        url = `/uploads/${name}`;
      }

      await prisma.lotPhoto.create({
        data: {
          lotId: lead.lots[0].id,
          url,
          alt: `Foto de lote de ${lead.name}`,
        },
      });
      urls.push(url);
    }

    return NextResponse.json({ ok: true, urls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'No se pudieron guardar las fotos.' }, { status: 500 });
  }
}
