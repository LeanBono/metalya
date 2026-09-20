/**
 * Factores aproximados de CO₂ evitado (kg CO₂e por kg de material reciclado
 * vs producción primaria). Valores orientativos de literatura de reciclaje
 * de metales; no son un inventario LCA formal.
 */
export const DEFAULT_CO2_FACTORS: Record<string, number> = {
  'Hierro y acero': 1.5,
  Hierro: 1.5,
  Acero: 1.5,
  Chapa: 1.5,
  Cobre: 3.5,
  'Cable de cobre': 3.2,
  Aluminio: 9.0,
  Bronce: 3.0,
  'Acero inoxidable': 4.5,
  'Motores eléctricos': 2.0,
};

export function co2FactorForName(name: string, override?: number | null): number {
  if (override != null && Number.isFinite(Number(override))) return Number(override);
  const key = Object.keys(DEFAULT_CO2_FACTORS).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  return key ? DEFAULT_CO2_FACTORS[key] : 1.8;
}

export function kgCo2Saved(kg: number, factor: number): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  return Math.round(kg * factor * 100) / 100;
}

/** Equivalencias comunicacionales (aprox.) */
export function co2ToTrees(kgCo2: number): number {
  // ~21 kg CO2/año por árbol urbano promedio
  return Math.round((kgCo2 / 21) * 10) / 10;
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} t`;
  return `${kg.toLocaleString('es-AR', { maximumFractionDigits: 0 })} kg`;
}
