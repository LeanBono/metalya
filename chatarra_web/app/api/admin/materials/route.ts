import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { z } from 'zod';
import { co2FactorForName } from '@/lib/co2';

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(80),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  co2FactorKg: z.coerce.number().min(0).max(50).optional(),
  minKg: z.coerce.number().min(0).optional(),
  zoneNote: z.string().max(160).optional(),
  publicList: z.boolean().optional(),
  unit: z.string().default('kg'),
});

const patchSchema = z.object({
  id: z.string().min(1),
  buyPrice: z.coerce.number().min(0).optional(),
  sellPrice: z.coerce.number().min(0).optional(),
  co2FactorKg: z.coerce.number().min(0).max(50).optional(),
  minKg: z.coerce.number().min(0).optional(),
  zoneNote: z.string().max(160).nullable().optional(),
  publicList: z.boolean().optional(),
  category: z.string().trim().min(2).max(80).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(await prisma.material.findMany({ orderBy: { category: 'asc' } }));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const d = createSchema.parse(await req.json());
    const factor = d.co2FactorKg ?? co2FactorForName(d.name);
    const row = await prisma.material.create({
      data: {
        name: d.name,
        category: d.category,
        buyPrice: d.buyPrice,
        sellPrice: d.sellPrice,
        co2FactorKg: factor,
        minKg: d.minKg ?? 0,
        zoneNote: d.zoneNote || null,
        publicList: d.publicList ?? true,
        unit: d.unit || 'kg',
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Datos inv\u00e1lidos o material existente.' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const d = patchSchema.parse(await req.json());
    const data: Record<string, unknown> = {};
    if (d.buyPrice != null) data.buyPrice = d.buyPrice;
    if (d.sellPrice != null) data.sellPrice = d.sellPrice;
    if (d.co2FactorKg != null) data.co2FactorKg = d.co2FactorKg;
    if (d.minKg !== undefined) data.minKg = d.minKg;
    if (d.zoneNote !== undefined) data.zoneNote = d.zoneNote;
    if (d.publicList != null) data.publicList = d.publicList;
    if (d.category != null) data.category = d.category;
    if (d.active != null) data.active = d.active;
    const row = await prisma.material.update({ where: { id: d.id }, data });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el material.' }, { status: 400 });
  }
}
