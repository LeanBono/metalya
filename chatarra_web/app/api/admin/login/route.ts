import { NextResponse } from 'next/server'; import { setAdmin } from '@/lib/auth';
export async function POST(req:Request){ const {password}=await req.json().catch(()=>({})); if(!process.env.ADMIN_PASSWORD || password!==process.env.ADMIN_PASSWORD) return NextResponse.json({error:'Contraseña incorrecta'},{status:401}); await setAdmin(); return NextResponse.json({ok:true}); }
