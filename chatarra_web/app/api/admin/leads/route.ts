import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'SCHEDULED', 'CLOSED', 'LOST']).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const leads = await prisma.lead.findMany({
    include: {
      lots: {
        include: { photos: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(leads);
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const d = patchSchema.parse(await req.json());
    const data: Record<string, unknown> = {};
    if (d.status) data.status = d.status;
    if (d.notes !== undefined) data.notes = d.notes;
    const row = await prisma.lead.update({ where: { id: d.id }, data });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 });
  }
}
