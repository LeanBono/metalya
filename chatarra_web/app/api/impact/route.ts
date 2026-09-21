import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { co2ToTrees, formatCo2 } from '@/lib/co2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const agg = await prisma.co2Log.aggregate({
      _sum: { co2Kg: true, kg: true },
      _count: true,
    });
    const totalCo2Kg = Number(agg._sum.co2Kg || 0);
    const totalKg = Number(agg._sum.kg || 0);
    return NextResponse.json({
      ok: true,
      totalCo2Kg,
      totalKg,
      events: agg._count,
      totalCo2Label: formatCo2(totalCo2Kg),
      treesEquivalent: co2ToTrees(totalCo2Kg),
    });
  } catch {
    // Tabla aún no migrada o DB offline: mostrar ceros sin romper la UI
    return NextResponse.json({
      ok: true,
      totalCo2Kg: 0,
      totalKg: 0,
      events: 0,
      totalCo2Label: '0 kg',
      treesEquivalent: 0,
    });
  }
}
