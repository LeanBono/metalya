import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { z } from 'zod';
import { kgCo2Saved } from '@/lib/co2';

const schema = z.object({
  actualSell: z.coerce.number().min(0),
  actualCost: z.coerce.number().min(0),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;
    const d = schema.parse(await req.json());
    const profit = d.actualSell - d.actualCost;

    const existing = await prisma.quote.findUnique({
      where: { id },
      include: {
        lot: {
          include: {
            items: { include: { material: true } },
          },
        },
      },
    });
    if (!existing) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });

    const q = await prisma.quote.update({
      where: { id },
      data: {
        actualSell: d.actualSell,
        actualCost: d.actualCost,
        actualProfit: profit,
        status: 'ACCEPTED',
        lot: {
          update: {
            status: 'CLOSED',
            collectedAt: new Date(),
          },
        },
      },
    });

    // Auto-registrar CO₂ por cada ítem del lote (evita duplicar si ya se cerró)
    const items = existing.lot?.items || [];
    if (items.length > 0 && existing.status !== 'ACCEPTED') {
      const logs = items.map((item) => {
        const factor = Number(item.material?.co2FactorKg ?? 1.8);
        const kg = Number(item.kg);
        return {
          lotId: existing.lotId,
          materialId: item.materialId,
          materialName: item.material?.name || 'Material',
          kg,
          factor,
          co2Kg: kgCo2Saved(kg, factor),
          source: 'collect',
          notes: `Cierre cotización ${id.slice(0, 8)}`,
        };
      });
      await prisma.co2Log.createMany({ data: logs });
    }

    return NextResponse.json(q);
  } catch {
    return NextResponse.json({ error: 'No se pudo cerrar la operación.' }, { status: 400 });
  }
}
