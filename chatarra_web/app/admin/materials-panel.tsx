'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type Mat = {
  id: string;
  name: string;
  category: string;
  buyPrice: number | string;
  sellPrice: number | string;
  co2FactorKg?: number | string;
  minKg?: number | string;
  zoneNote?: string | null;
  publicList?: boolean;
  unit?: string;
  active?: boolean;
  updatedAt?: string;
};

const REFRESH_MS = 30_000;

function mapRows(list: Mat[]) {
  return list.map((m) => ({
    ...m,
    buyPrice: Number(m.buyPrice),
    sellPrice: Number(m.sellPrice),
    co2FactorKg: Number(m.co2FactorKg ?? 1.8),
    minKg: Number(m.minKg ?? 0),
    zoneNote: m.zoneNote || '',
    publicList: false,
  }));
}

export default function MaterialsPanel({ initial }: { initial: Mat[] }) {
  const [rows, setRows] = useState(() => mapRows(initial));
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date>(() => new Date());
  const [syncing, setSyncing] = useState(false);
  const dirty = useRef<Set<string>>(new Set());

  const refreshFromServer = useCallback(async (silent = true) => {
    if (dirty.current.size > 0) {
      if (!silent) setMsg('Hay cambios sin guardar: guardalos antes de refrescar.');
      return;
    }
    setSyncing(true);
    try {
      const r = await fetch('/api/admin/materials', { cache: 'no-store' });
      if (!r.ok) throw new Error('No se pudo cargar materiales');
      const data = await r.json();
      if (Array.isArray(data)) {
        setRows(mapRows(data));
        setLastSync(new Date());
        if (!silent) setMsg('Precios actualizados desde el servidor.');
      }
    } catch (e) {
      if (!silent) setMsg(e instanceof Error ? e.message : 'Error al refrescar');
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      void refreshFromServer(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshFromServer]);

  async function saveRow(m: (typeof rows)[0]) {
    setSaving(m.id);
    setMsg('');
    try {
      const r = await fetch('/api/admin/materials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: m.id,
          buyPrice: m.buyPrice,
          sellPrice: m.sellPrice,
          co2FactorKg: m.co2FactorKg,
          minKg: m.minKg,
          zoneNote: m.zoneNote || null,
          publicList: false,
        }),
      });
      if (!r.ok) throw new Error('Error al guardar');
      dirty.current.delete(m.id);
      setMsg(m.name + ': precio guardado');
      setLastSync(new Date());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(null);
    }
  }

  async function saveAll() {
    setMsg('');
    for (const m of rows) {
      if (!dirty.current.has(m.id)) continue;
      await saveRow(m);
    }
  }

  async function addMaterial(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get('name') || ''),
      category: String(f.get('category') || 'General'),
      buyPrice: Number(f.get('buyPrice') || 0),
      sellPrice: Number(f.get('sellPrice') || 0),
      co2FactorKg: Number(f.get('co2FactorKg') || 1.8),
      minKg: 0,
      zoneNote: String(f.get('zoneNote') || '') || undefined,
      publicList: false,
    };
    const r = await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setMsg('No se pudo crear el material');
      return;
    }
    const created = await r.json();
    setRows((prev) => [
      ...prev,
      {
        ...created,
        buyPrice: Number(created.buyPrice),
        sellPrice: Number(created.sellPrice),
        co2FactorKg: Number(created.co2FactorKg),
        minKg: 0,
        zoneNote: created.zoneNote || '',
        publicList: false,
      },
    ]);
    e.currentTarget.reset();
    setMsg('Material creado (solo visible en admin)');
    setLastSync(new Date());
  }

  function update(id: string, field: string, value: string | number | boolean) {
    dirty.current.add(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  const timeLabel = lastSync.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Materiales y precios (solo admin)</h2>
        <button type="button" className="btn ghost" disabled={syncing} onClick={() => refreshFromServer(false)}>
          {syncing ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
        <button type="button" className="btn primary" onClick={() => void saveAll()}>
          Guardar cambios
        </button>
        <small style={{ opacity: 0.75 }}>
          Auto-refresh cada {REFRESH_MS / 1000}s | ultima sync {timeLabel}
        </small>
      </div>
      <p>
        Estos precios son internos: no se publican en la web. Usa la calculadora y cotiza por lote para poder negociar.
      </p>
      {msg && <p className="adminMsg">{msg}</p>}
      <table className="adminTable">
        <thead>
          <tr>
            <th>Material</th>
            <th>Compra $/kg</th>
            <th>Venta $/kg</th>
            <th>CO2</th>
            <th>Zona</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>
                <b>{m.name}</b>
                <br />
                <small>{m.category}</small>
              </td>
              <td>
                <input className="kgInput" type="number" min={0} value={m.buyPrice} onChange={(e) => update(m.id, 'buyPrice', Number(e.target.value))} />
              </td>
              <td>
                <input className="kgInput" type="number" min={0} value={m.sellPrice} onChange={(e) => update(m.id, 'sellPrice', Number(e.target.value))} />
              </td>
              <td>
                <input className="kgInput" type="number" min={0} step={0.1} value={m.co2FactorKg} onChange={(e) => update(m.id, 'co2FactorKg', Number(e.target.value))} />
              </td>
              <td>
                <input style={{ width: 100 }} value={m.zoneNote} onChange={(e) => update(m.id, 'zoneNote', e.target.value)} placeholder="CABA/GBA" />
              </td>
              <td>
                <button type="button" className="btn primary" disabled={saving === m.id} onClick={() => saveRow(m)}>
                  {saving === m.id ? '...' : 'Guardar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 28 }}>Agregar material</h3>
      <form className="materialForm" onSubmit={addMaterial} style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))' }}>
        <input name="name" required placeholder="Nombre" />
        <input name="category" placeholder="Categoria" defaultValue="Ferrosos" />
        <input name="buyPrice" type="number" min={0} required placeholder="Compra" />
        <input name="sellPrice" type="number" min={0} required placeholder="Venta" />
        <input name="co2FactorKg" type="number" min={0} step={0.1} placeholder="CO2/kg" defaultValue={1.8} />
        <input name="zoneNote" placeholder="Zona" />
        <button className="btn primary" type="submit">
          + Material
        </button>
      </form>
    </div>
  );
}
