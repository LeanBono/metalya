'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Mat = {
  id: string;
  name: string;
  category: string;
  buyPrice: number | string;
  unit: string;
  minKg: number | string;
  zoneNote?: string | null;
  co2FactorKg?: number | string;
};

export default function PreciosPage() {
  const [materials, setMaterials] = useState<Mat[]>([]);
  const [note, setNote] = useState('');
  const [kg, setKg] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/prices')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setMaterials(j.materials || []);
          setNote(j.note || '');
        }
      })
      .catch(() => {});
  }, []);

  const estimate = useMemo(() => {
    let total = 0;
    let co2 = 0;
    let kgSum = 0;
    for (const m of materials) {
      const k = Number(kg[m.id] || 0);
      if (k <= 0) continue;
      total += k * Number(m.buyPrice);
      co2 += k * Number(m.co2FactorKg ?? 1.8);
      kgSum += k;
    }
    return { total, co2, kgSum };
  }, [materials, kg]);

  const money = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const byCat = materials.reduce<Record<string, Mat[]>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'system-ui,sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: 'none', color: '#161713' }}>
          Metal<span style={{ color: '#6b7e00' }}>Ya</span>
        </Link>
        <Link href="/#cotizar" style={{ background: '#151713', color: '#fff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          Cotizar lote real →
        </Link>
      </header>
      <h1 style={{ fontSize: 36, letterSpacing: '-0.03em', marginBottom: 8 }}>Precios orientativos</h1>
      <p style={{ color: '#666', maxWidth: 560, lineHeight: 1.6 }}>{note || 'Referencia de lo que pagamos por material. La oferta final depende del lote.'}</p>

      {Object.entries(byCat).map(([cat, list]) => (
        <section key={cat} style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>{cat}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e6e2d8', borderRadius: 12 }}>
            <thead>
              <tr style={{ background: '#f4f1ea' }}>
                <th style={{ textAlign: 'left', padding: 12 }}>Material</th>
                <th style={{ textAlign: 'right', padding: 12 }}>Compra $/kg</th>
                <th style={{ textAlign: 'right', padding: 12 }}>Mín. kg</th>
                <th style={{ textAlign: 'right', padding: 12 }}>Tu kg</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Zona</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: 12, borderTop: '1px solid #eee' }}><b>{m.name}</b></td>
                  <td style={{ padding: 12, borderTop: '1px solid #eee', textAlign: 'right' }}>{money(Number(m.buyPrice))}</td>
                  <td style={{ padding: 12, borderTop: '1px solid #eee', textAlign: 'right' }}>{Number(m.minKg) || '—'}</td>
                  <td style={{ padding: 12, borderTop: '1px solid #eee', textAlign: 'right' }}>
                    <input
                      type="number"
                      min={0}
                      style={{ width: 90, padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
                      value={kg[m.id] || ''}
                      onChange={(e) => setKg((prev) => ({ ...prev, [m.id]: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </td>
                  <td style={{ padding: 12, borderTop: '1px solid #eee', fontSize: 13, color: '#666' }}>{m.zoneNote || 'CABA / GBA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <aside style={{ marginTop: 32, padding: 24, background: '#151713', color: '#fff', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>Estimación orientativa</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#d9ff45' }}>{money(estimate.total)}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{estimate.kgSum.toLocaleString('es-AR')} kg · ~{Math.round(estimate.co2).toLocaleString('es-AR')} kg CO₂ evitable</div>
          </div>
          <a href="/#cotizar" style={{ alignSelf: 'center', background: '#d9ff45', color: '#151713', padding: '14px 20px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Pedir cotización real →
          </a>
        </div>
      </aside>
    </main>
  );
}
