import { redirect } from 'next/navigation';

/** Precios publicos deshabilitados: cotizacion solo por consulta. */
export default function PreciosPage() {
  redirect('/#cotizar');
}
