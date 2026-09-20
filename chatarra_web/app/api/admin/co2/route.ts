import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { co2FactorForName, kgCo2Saved } from '@/lib/co2';

const schema = z.object({
  materialId: z.string().optional(),
  materialName: z.string().trim().min(1).max(80),
  kg: z.coerce.number().positive().max(10_000_000),
  lotId: z.string().optional(),
  source: z.enum(['manual', 'quote', 'collect']).default('manual'),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [logs, agg] = await Promise.all([
    prisma.co2Log.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.co2Log.aggregate({ _sum: { co2Kg: true, kg: true }, _count: true }),
  ]);
  return NextResponse.json({
    logs,
    totalCo2Kg: Number(agg._sum.co2Kg || 0),
    totalKg: Number(agg._sum.kg || 0),
    events: agg._count,
  });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const d = schema.parse(await req.json());
    let factor = co2FactorForName(d.materialName);
    if (d.materialId) {
      const m = await prisma.material.findUnique({ where: { id: d.materialId } });
      if (m) factor = Number(m.co2FactorKg);
    }
    const co2Kg = kgCo2Saved(d.kg, factor);
    const row = await prisma.co2Log.create({
      data: {
        materialId: d.materialId || null,
        materialName: d.materialName,
        kg: d.kg,
        factor,
        co2Kg,
        lotId: d.lotId || null,
        source: d.source,
        notes: d.notes || null,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }
}
