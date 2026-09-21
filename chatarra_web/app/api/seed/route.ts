import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { seedMaterials } from '@/lib/seed';
import { prisma } from '@/lib/prisma';

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await seedMaterials();
    await prisma.$executeRawUnsafe('UPDATE "Material" SET "minKg" = 0');
    const count = await prisma.material.count();
    return NextResponse.json({ ok: true, count, minKg: 0 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al sembrar';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
