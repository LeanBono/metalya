'use client';

import { useEffect, useState } from 'react';

type Impact = {
  totalCo2Label: string;
  totalKg: number;
  treesEquivalent: number;
  events: number;
};

export default function ImpactBanner() {
  const [data, setData] = useState<Impact | null>(null);

  useEffect(() => {
    fetch('/api/impact')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok !== false) setData(j);
      })
      .catch(() => {});
  }, []);

  const co2 = data?.totalCo2Label || '—';
  const kg = data ? data.totalKg.toLocaleString('es-AR') : '—';
  const trees = data?.treesEquivalent ?? '—';
  const events = data?.events ?? 0;

  return (
    <section className="impactSection reveal">
      <div className="impactInner">
        <div className="eyebrow impactEyebrow">IMPACTO AMBIENTAL</div>
        <h2>
          Reciclar metales es <span>ahorrar CO₂</span>
        </h2>
        <p className="impactLead">
          Cada kilo recuperado evita emisiones de la producción primaria. MetalYa registra el
          impacto de los materiales que procesamos
          {events > 0 ? ` · ${events} operaciones registradas` : ''}.
        </p>
        <div className="impactGrid">
          <div className="impactCard floaty">
            <span>CO₂ evitado</span>
            <strong>{co2}</strong>
            <small>acumulado registrado</small>
          </div>
          <div className="impactCard floaty delay1">
            <span>Material reciclado</span>
            <strong>{kg} kg</strong>
            <small>en operaciones registradas</small>
          </div>
          <div className="impactCard floaty delay2">
            <span>Equiv. árboles / año</span>
            <strong>{trees}</strong>
            <small>orden de magnitud orientativo</small>
          </div>
        </div>
        <p className="impactNote">
          Factores orientativos de reciclaje de metales. No sustituyen un estudio LCA formal.
        </p>
      </div>
    </section>
  );
}
