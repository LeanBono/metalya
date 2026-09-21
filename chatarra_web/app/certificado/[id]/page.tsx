import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { co2ToTrees, formatCo2 } from '@/lib/co2';

export const dynamic = 'force-dynamic';

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = await prisma.co2Log.findUnique({ where: { id } });
  if (!log) notFound();

  const trees = co2ToTrees(Number(log.co2Kg));

  return (
    <main style={{ fontFamily: 'system-ui,sans-serif', maxWidth: 640, margin: '48px auto', padding: 32, border: '2px solid #d9ff45', borderRadius: 16 }}>
      <style>{`@media print { .no-print { display:none } }`}</style>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <button type="button" id="printBtn" style={{ padding: '10px 16px', cursor: 'pointer' }}>Imprimir certificado</button>
        <script dangerouslySetInnerHTML={{ __html: `document.getElementById('printBtn')?.addEventListener('click',()=>window.print())` }} />
      </div>
      <p style={{ letterSpacing: '0.12em', fontSize: 12, fontWeight: 700, color: '#6b7e00' }}>CERTIFICADO DE IMPACTO</p>
      <h1 style={{ fontSize: 28, margin: '8px 0 20px' }}>MetalYa · CO₂ evitado</h1>
      <p>
        Se certifica que el material <b>{log.materialName}</b> ({Number(log.kg).toLocaleString('es-AR')} kg)
        evitó aproximadamente <b>{formatCo2(Number(log.co2Kg))}</b> de CO₂e respecto de la producción primaria.
      </p>
      <p style={{ color: '#555' }}>
        Equivalencia orientativa: ~{trees} árboles urbanos / año.
      </p>
      <p style={{ fontSize: 13, color: '#888', marginTop: 32 }}>
        Fecha: {new Date(log.createdAt).toLocaleDateString('es-AR')} · Origen: {log.source} · ID: {log.id.slice(0, 12)}
      </p>
      <p style={{ fontSize: 11, color: '#aaa', marginTop: 16 }}>
        Factores orientativos de reciclaje de metales. No sustituye un estudio LCA formal.
      </p>
    </main>
  );
}
