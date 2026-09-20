'use client';

import { FormEvent, useEffect, useState } from 'react';

type Log = {
  id: string;
  materialName: string;
  kg: number | string;
  co2Kg: number | string;
  factor: number | string;
  source: string;
  createdAt: string;
};

export default function Co2Panel({ materials }: { materials: { id: string; name: string }[] }) {
  const [totalCo2, setTotalCo2] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const r = await fetch('/api/admin/co2');
    if (!r.ok) return;
    const j = await r.json();
    setTotalCo2(Number(j.totalCo2Kg || 0));
    setTotalKg(Number(j.totalKg || 0));
    setLogs(j.logs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    const f = new FormData(e.currentTarget);
    const materialId = String(f.get('materialId') || '');
    const materialName =
      materials.find((m) => m.id === materialId)?.name || String(f.get('materialName') || '');
    const body = {
      materialId: materialId || undefined,
      materialName,
      kg: Number(f.get('kg') || 0),
      source: 'manual' as const,
      notes: String(f.get('notes') || '') || undefined,
    };
    const r = await fetch('/api/admin/co2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setMsg('No se pudo registrar el impacto');
      return;
    }
    setMsg('Impacto CO₂ registrado');
    e.currentTarget.reset();
    load();
  }

  return (
    <div>
      <h2>Impacto CO₂</h2>
      <p>
        Registrá kg procesados por material. Se calcula el CO₂ evitado y queda almacenado en la base.
      </p>
      <div className="adminGrid" style={{ marginTop: 12 }}>
        <div className="metric">
          <span>CO₂ evitado acumulado</span>
          <strong>{totalCo2.toLocaleString('es-AR')} kg</strong>
        </div>
        <div className="metric">
          <span>Material reciclado</span>
          <strong>{totalKg.toLocaleString('es-AR')} kg</strong>
        </div>
      </div>
      {msg && <p className="adminMsg">{msg}</p>}
      <form className="materialForm" onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <select name="materialId" required defaultValue="">
          <option value="" disabled>
            Material
          </option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input name="kg" type="number" min={0.1} step={0.1} required placeholder="Kg" />
        <input name="notes" placeholder="Notas (opcional)" />
        <button className="btn primary" type="submit">
          Registrar CO₂
        </button>
      </form>
      <table className="adminTable" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Material</th>
            <th>Kg</th>
            <th>Factor</th>
            <th>CO₂ kg</th>
            <th>Origen</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.createdAt).toLocaleDateString('es-AR')}</td>
              <td>{l.materialName}</td>
              <td>{Number(l.kg).toLocaleString('es-AR')}</td>
              <td>{Number(l.factor)}</td>
              <td>
                <b>{Number(l.co2Kg).toLocaleString('es-AR')}</b>
              </td>
              <td>{l.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
