'use client';

import { useState } from 'react';

type QuoteRow = {
  id: string;
  offer: number | string;
  estimatedSell: number | string;
  operatingCost: number | string;
  margin: number | string;
  actualProfit: number | string | null;
  status: string;
  lot?: { title?: string | null } | null;
};

const money = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export default function CloseQuotes({ quotes }: { quotes: QuoteRow[] }) {
  const open = quotes.filter((q) => q.actualProfit === null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<Record<string, { sell: string; cost: string }>>({});

  async function closeQuote(id: string) {
    const f = form[id] || { sell: '', cost: '' };
    const actualSell = Number(f.sell);
    const actualCost = Number(f.cost);
    if (!Number.isFinite(actualSell) || !Number.isFinite(actualCost)) {
      setMsg('Ingresá venta real y costo real');
      return;
    }
    setBusy(id);
    setMsg('');
    try {
      const r = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualSell, actualCost }),
      });
      if (!r.ok) throw new Error('Error al cerrar');
      setMsg('Operación cerrada · CO₂ registrado automáticamente');
      // refresh page data
      window.location.reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(null);
    }
  }

  if (open.length === 0) {
    return (
      <p style={{ color: '#666', fontSize: 14 }}>
        No hay cotizaciones abiertas para cerrar. Al cerrar una se registra el CO₂ del lote.
      </p>
    );
  }

  return (
    <div>
      <p style={{ marginBottom: 12, fontSize: 14, color: '#555' }}>
        Al cerrar una operación se guarda la ganancia real y se registra automáticamente el CO₂
        evitado según los kg del lote.
      </p>
      {msg && <p className="adminMsg">{msg}</p>}
      <table className="adminTable">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Oferta</th>
            <th>Venta real $</th>
            <th>Costo real $</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {open.map((q) => {
            const f = form[q.id] || {
              sell: String(Math.round(Number(q.estimatedSell))),
              cost: String(Math.round(Number(q.offer) + Number(q.operatingCost))),
            };
            return (
              <tr key={q.id}>
                <td>
                  <b>{q.lot?.title || '—'}</b>
                  <br />
                  <small>{q.status}</small>
                </td>
                <td>{money(Number(q.offer))}</td>
                <td>
                  <input
                    className="kgInput"
                    type="number"
                    min={0}
                    value={f.sell}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [q.id]: { ...f, sell: e.target.value } }))
                    }
                  />
                </td>
                <td>
                  <input
                    className="kgInput"
                    type="number"
                    min={0}
                    value={f.cost}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [q.id]: { ...f, cost: e.target.value } }))
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn primary"
                    disabled={busy === q.id}
                    onClick={() => closeQuote(q.id)}
                  >
                    {busy === q.id ? '...' : 'Cerrar + CO₂'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
