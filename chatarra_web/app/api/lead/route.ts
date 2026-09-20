import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notifyNewLead, leadWhatsAppMessage, whatsappLink } from '@/lib/notify';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  phone: z.string().trim().min(6).max(40),
  location: z.string().trim().max(160).optional().or(z.literal('')),
  service: z.string().trim().min(2).max(80),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true),
  estimatedKg: z.coerce.number().min(0).max(10_000_000).optional(),
});

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const lotTitle = (`Solicitud - ${d.service || 'consulta'}`).slice(0, 120);

    const lead = await prisma.lead.create({
      data: {
        name: d.name,
        company: d.company || null,
        email: d.email || null,
        phone: d.phone,
        location: d.location || null,
        service: d.service,
        message: d.message || null,
        consent: d.consent,
      },
    });

    const lot = await prisma.lot.create({
      data: {
        leadId: lead.id,
        title: lotTitle,
        description: d.message || null,
        location: d.location || null,
        estimatedKg: d.estimatedKg ?? null,
      },
    });

    const notifyPayload = {
      id: lead.id,
      name: d.name,
      phone: d.phone,
      company: d.company || null,
      location: d.location || null,
      service: d.service,
      message: d.message || null,
      estimatedKg: d.estimatedKg ?? null,
    };
    void notifyNewLead(notifyPayload).catch(() => {});

    const clientWa = whatsappLink(
      leadWhatsAppMessage({
        name: d.name,
        phone: d.phone,
        company: d.company,
        location: d.location,
        service: d.service,
        estimatedKg: d.estimatedKg,
      })
    );

    return NextResponse.json(
      { ok: true, id: lead.id, lotId: lot.id, whatsapp: clientWa },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Revisa los datos ingresados.' }, { status: 400 });
    }
    console.error('lead create error', e);
    return NextResponse.json({ error: 'No pudimos guardar la solicitud.' }, { status: 500 });
  }
}
