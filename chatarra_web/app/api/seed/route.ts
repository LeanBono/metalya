import { NextResponse } from 'next/server'; import { isAdmin } from '@/lib/auth'; import { seedMaterials } from '@/lib/seed';
export async function POST(){ if(!(await isAdmin())) return NextResponse.json({error:'No autorizado'},{status:401}); await seedMaterials(); return NextResponse.json({ok:true}); }
