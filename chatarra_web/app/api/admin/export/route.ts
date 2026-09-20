import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'summary';
  const days = Math.min(90, Math.max(1, Number(searchParams.get('days') || 7)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (type === 'leads') {
    const leads = await prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      include: { lots: true },
      orderBy: { createdAt: 'desc' },
    });
    const header = ['fecha', 'nombre', 'empresa', 'telefono', 'email', 'ubicacion', 'servicio', 'kg', 'estado'];
    const rows = leads.map((l) => [
      l.createdAt.toISOString(),
      l.name,
      l.company || '',
      l.phone,
      l.email || '',
      l.location || '',
      l.service,
      l.lots[0]?.estimatedKg ?? '',
      l.status,
    ]);
    const body = [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${days}d.csv"`,
      },
    });
  }

  if (type === 'co2') {
    const logs = await prisma.co2Log.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
    const header = ['fecha', 'material', 'kg', 'factor', 'co2Kg', 'origen', 'notas'];
    const rows = logs.map((l) => [
      l.createdAt.toISOString(),
      l.materialName,
      l.kg,
      l.factor,
      l.co2Kg,
      l.source,
      l.notes || '',
    ]);
    const body = [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="co2-${days}d.csv"`,
      },
    });
  }

  const [leads, quotes, co2] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.quote.findMany({ where: { createdAt: { gte: since } } }),
    prisma.co2Log.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { co2Kg: true, kg: true },
      _count: true,
    }),
  ]);
  const margin = quotes.reduce((s, q) => s + Number(q.actualProfit ?? q.margin), 0);
  const header = ['periodo_dias', 'leads', 'cotizaciones', 'margen_ars', 'kg_reciclados', 'co2_kg', 'eventos_co2'];
  const row = [days, leads, quotes.length, Math.round(margin), Number(co2._sum.kg || 0), Number(co2._sum.co2Kg || 0), co2._count];
  const body = [header.join(','), row.map(csvEscape).join(',')].join('\n');
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="resumen-${days}d.csv"`,
    },
  });
}
