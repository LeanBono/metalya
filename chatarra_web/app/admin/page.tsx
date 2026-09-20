import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import AdminActions from './ui';
import Calculator from './calculadora';
import MaterialsPanel from './materials-panel';
import Co2Panel from './co2-panel';

export default async function Admin() {
  if (!(await isAdmin())) redirect('/admin/login');

  let leads: any[] = [];
  let materials: any[] = [];
  let quotes: any[] = [];
  let dbError = '';

  try {
    const result = await Promise.all([
      prisma.lead.findMany({
        include: { lots: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.material.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.quote.findMany({
        include: { lot: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);
    leads = result[0];
    materials = result[1];
    quotes = result[2];
  } catch (e) {
    console.error('Admin DB error', e);
    dbError =
      'No se pudo conectar a la base de datos. Revisá DATABASE_URL en Vercel (Neon) y ejecutá prisma db push.';
  }

  const newCount = leads.filter((x) => x.status === 'NEW').length;
  const kg = leads.reduce(
    (s, l) => s + Number(l.lots.reduce((a: number, z: any) => a + Number(z.estimatedKg || 0), 0)),
    0
  );
  const closed = quotes.filter((q) => q.actualProfit !== null);
  const projected = quotes.reduce((s, q) => s + Number(q.margin), 0);
  const realized = closed.reduce((s, q) => s + Number(q.actualProfit || 0), 0);
  const money = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  return (
    <main className="adminWrap">
      <div className="adminNav">
        <div>
          <a className="brand" href="/">
            <span className="mark">M</span>
            <span>
              Metal<span>Ya</span>
            </span>
          </a>
          <p>Centro de operaciones · V1.2</p>
        </div>
        <AdminActions />
      </div>

      {dbError && (
        <div className="adminPanel" style={{ borderColor: '#c44', background: '#2a1515', color: '#fcc' }}>
          <h2>Error de base de datos</h2>
          <p>{dbError}</p>
        </div>
      )}

      <div className="adminGrid">
        <div className="metric">
          <span>Nuevas consultas</span>
          <strong>{newCount}</strong>
        </div>
        <div className="metric">
          <span>Clientes registrados</span>
          <strong>{leads.length}</strong>
        </div>
        <div className="metric">
          <span>Kg estimados</span>
          <strong>{kg.toLocaleString('es-AR')}</strong>
        </div>
        <div className="metric">
          <span>Cotizaciones</span>
          <strong>{quotes.length}</strong>
        </div>
        <div className="metric">
          <span>Ganancia proyectada</span>
          <strong>{money(projected)}</strong>
        </div>
        <div className="metric">
          <span>Ganancia realizada</span>
          <strong>{money(realized)}</strong>
        </div>
      </div>

      <div className="adminPanel">
        <h2>Calculadora de lotes</h2>
        <p>
          Cargá los materiales, costos y margen objetivo. MetalYa calcula la oferta máxima
          recomendada y la rentabilidad.
        </p>
        <Calculator materials={materials as any} />
      </div>

      <div className="adminPanel">
        <h2>Solicitudes recientes</h2>
        <table className="adminTable">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Material / servicio</th>
              <th>Ubicación</th>
              <th>Kg</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleDateString('es-AR')}</td>
                <td>
                  <b>{l.name}</b>
                  <br />
                  {l.phone}
                </td>
                <td>{l.company || '—'}</td>
                <td>
                  {l.service}
                  <br />
                  <small>{l.message || ''}</small>
                </td>
                <td>{l.location || '—'}</td>
                <td>
                  {l.lots[0]?.estimatedKg
                    ? Number(l.lots[0].estimatedKg).toLocaleString('es-AR')
                    : '—'}
                </td>
                <td>
                  <span className="status">{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adminPanel">
        <h2>Historial de cotizaciones</h2>
        <table className="adminTable">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Lote</th>
              <th>Oferta</th>
              <th>Ganancia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id}>
                <td>{new Date(q.createdAt).toLocaleDateString('es-AR')}</td>
                <td>{q.lot?.title || '—'}</td>
                <td>{money(Number(q.offer))}</td>
                <td>{money(Number(q.actualProfit ?? q.margin))}</td>
                <td>
                  <span className="status">{q.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adminPanel">
        <MaterialsPanel initial={materials as any} />
      </div>

      <div className="adminPanel">
        <Co2Panel materials={materials.map((m: any) => ({ id: m.id, name: m.name }))} />
      </div>
    </main>
  );
}
