'use client';

import { FormEvent, useState } from 'react';

type Mat = {
  id: string;
  name: string;
  category: string;
  buyPrice: number | string;
  sellPrice: number | string;
  co2FactorKg?: number | string;
  unit?: string;
  active?: boolean;
};

export default function MaterialsPanel({ initial }: { initial: Mat[] }) {
  const [rows, setRows] = useState(
    initial.map((m) => ({
      ...m,
      buyPrice: Number(m.buyPrice),
      sellPrice: Number(m.sellPrice),
      co2FactorKg: Number(m.co2FactorKg ?? 1.8),
    }))
  );
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

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
        }),
      });
      if (!r.ok) throw new Error('Error al guardar');
      setMsg(`Precio de ${m.name} actualizado`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(null);
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
      },
    ]);
    e.currentTarget.reset();
    setMsg('Material creado');
  }

  function update(id: string, field: string, value: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <div>
      <h2>Materiales y precios</h2>
      <p>Editá compra, venta y factor de CO₂ (kg CO₂e evitados por kg reciclado).</p>
      {msg && <p className="adminMsg">{msg}</p>}
      <table className="adminTable">
        <thead>
          <tr>
            <th>Material</th>
            <th>Categoría</th>
            <th>Compra $/kg</th>
            <th>Venta $/kg</th>
            <th>CO₂ factor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>
                <b>{m.name}</b>
              </td>
              <td>{m.category}</td>
              <td>
                <input
                  className="kgInput"
                  type="number"
                  min={0}
                  step={1}
                  value={m.buyPrice}
                  onChange={(e) => update(m.id, 'buyPrice', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  className="kgInput"
                  type="number"
                  min={0}
                  step={1}
                  value={m.sellPrice}
                  onChange={(e) => update(m.id, 'sellPrice', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  className="kgInput"
                  type="number"
                  min={0}
                  step={0.1}
                  value={m.co2FactorKg}
                  onChange={(e) => update(m.id, 'co2FactorKg', Number(e.target.value))}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn primary"
                  disabled={saving === m.id}
                  onClick={() => saveRow(m)}
                >
                  {saving === m.id ? '...' : 'Guardar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 28 }}>Agregar material</h3>
      <form className="materialForm" onSubmit={addMaterial}>
        <input name="name" required placeholder="Nombre" />
        <input name="category" placeholder="Categoría" defaultValue="Ferrosos" />
        <input name="buyPrice" type="number" min={0} required placeholder="Compra" />
        <input name="sellPrice" type="number" min={0} required placeholder="Venta" />
        <input name="co2FactorKg" type="number" min={0} step={0.1} placeholder="CO₂/kg" defaultValue={1.8} />
        <button className="btn primary" type="submit">
          + Material
        </button>
      </form>
    </div>
  );
}
