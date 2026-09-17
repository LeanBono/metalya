import { NextResponse } from 'next/server'; import { prisma } from '@/lib/prisma'; import { isAdmin } from '@/lib/auth';
export async function GET(){if(!(await isAdmin()))return NextResponse.json({error:'No autorizado'},{status:401});const leads=await prisma.lead.findMany({include:{lots:true},orderBy:{createdAt:'desc'},take:200});return NextResponse.json(leads);}
