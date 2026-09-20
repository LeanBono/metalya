import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Lista pública orientativa de precios de compra (lo que MetalYa paga) */
export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { active: true, publicList: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        category: true,
        buyPrice: true,
        unit: true,
        minKg: true,
        zoneNote: true,
        co2FactorKg: true,
      },
    });
    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      note: 'Precios orientativos de referencia. La cotización final depende del lote, calidad y logística.',
      materials,
    });
  } catch {
    return NextResponse.json({ ok: false, materials: [] });
  }
}
