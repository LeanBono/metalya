import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Endpoint publico deshabilitado: los precios no se publican. */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      disabled: true,
      message: 'Los precios no son publicos. Solicita una cotizacion personalizada.',
      materials: [],
    },
    { status: 404 }
  );
}
