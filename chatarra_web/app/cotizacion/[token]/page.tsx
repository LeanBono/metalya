import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCo2, kgCo2Saved } from '@/lib/co2';

export const dynamic = 'force-dynamic';

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({
    where: { publicToken: token },
    include: {
      lot: {
        include: {
          lead: true,
          items: { include: { material: true } },
        },
      },
    },
  });
  if (!quote) notFound();

  const money = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const items = quote.lot?.items || [];
  let co2 = 0;
  for (const it of items) {
    co2 += kgCo2Saved(Number(it.kg), Number(it.material?.co2FactorKg ?? 1.8));
  }

  return (
    <main style={{ fontFamily: 'system-ui,sans-serif', maxWidth: 720, margin: '40px auto', padding: 24, color: '#161713' }}>
      <style>{`
        @media print { .no-print { display: none !important } body { margin: 0 } }
        .printBtn { padding: 10px 16px; background: #151713; color: #fff; border: 0; border-radius: 8px; cursor: pointer; font-weight: 600 }
      `}</style>
      <div className="no-print" style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <button type="button" className="printBtn" id="printBtn">Imprimir / Guardar PDF</button>
        <a href="/">MetalYa</a>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById('printBtn')?.addEventListener('click',()=>window.print())`,
          }}
        />
      </div>
      <header style={{ borderBottom: '3px solid #d9ff45', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>MetalYa \u2014 Cotizaci\u00f3n</h1>
        <p style={{ color: '#666', margin: '8px 0 0' }}>Compra de chatarra \u00b7 Retiros \u00b7 Buenos Aires</p>
      </header>
      <p>
        <b>Fecha:</b> {new Date(quote.createdAt).toLocaleDateString('es-AR')}
        {quote.validUntil && (
          <>
            {' '}
            \u00b7 <b>V\u00e1lida hasta:</b> {new Date(quote.validUntil).toLocaleDateString('es-AR')}
          </>
        )}
      </p>
      <p>
        <b>Lote:</b> {quote.lot?.title || '\u2014'}
        {quote.lot?.location && <> \u00b7 {quote.lot.location}</>}
      </p>
      {quote.lot?.lead && (
        <p>
          <b>Cliente:</b> {quote.lot.lead.name}
          {quote.lot.lead.company ? ` (${quote.lot.lead.company})` : ''} \u00b7 {quote.lot.lead.phone}
        </p>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#f4f1ea' }}>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #ddd' }}>Material</th>
            <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Kg</th>
            <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>$/kg ref.</th>
            <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{it.material?.name || '\u2014'}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                {Number(it.kg).toLocaleString('es-AR')}
              </td>
              <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                {money(Number(it.buyPrice))}
              </td>
              <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                {money(Number(it.kg) * Number(it.buyPrice))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 28, padding: 20, background: '#151713', color: '#fff', borderRadius: 12 }}>
        <p style={{ margin: '0 0 8px' }}>Oferta al cliente</p>
        <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#d9ff45' }}>{money(Number(quote.offer))}</p>
        <p style={{ margin: '12px 0 0', fontSize: 13, opacity: 0.75 }}>
          CO\u2082 evitable estimado: {formatCo2(co2)}
        </p>
      </div>
      {quote.notes && (
        <p style={{ marginTop: 20, color: '#555' }}>
          <b>Notas:</b> {quote.notes}
        </p>
      )}
      <p style={{ marginTop: 40, fontSize: 12, color: '#888' }}>
        Documento orientativo generado por MetalYa. La oferta final puede ajustarse tras inspecci\u00f3n y pesaje.
      </p>
    </main>
  );
}
