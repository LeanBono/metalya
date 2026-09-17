import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {isAdmin} from '@/lib/auth';
import {z} from 'zod';
const schema=z.object({actualSell:z.coerce.number().min(0),actualCost:z.coerce.number().min(0)});
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){if(!(await isAdmin()))return NextResponse.json({error:'No autorizado'},{status:401});try{const {id}=await params;const d=schema.parse(await req.json());const profit=d.actualSell-d.actualCost;const q=await prisma.quote.update({where:{id},data:{actualSell:d.actualSell,actualCost:d.actualCost,actualProfit:profit,status:'ACCEPTED',lot:{update:{status:'CLOSED',collectedAt:new Date()}}}});return NextResponse.json(q);}catch{return NextResponse.json({error:'No se pudo cerrar la operación.'},{status:400});}}
