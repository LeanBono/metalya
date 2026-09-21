import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notifyNewLead, leadWhatsAppMessage, whatsappLink } from '@/lib/notify';

const fieldLabels: Record<string, string> = {
  name: 'Nombre',
  phone: 'Teléfono / WhatsApp',
  email: 'Email',
  company: 'Empresa',
  location: 'Ubicación',
  service: 'Servicio',
  message: 'Mensaje',
  consent: 'Consentimiento',
  estimatedKg: 'Cantidad (kg)',
};

const schema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(80, 'El nombre es demasiado largo.'),
  company: z.string().trim().max(120, 'La empresa es demasiado larga.').optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string({ required_error: 'El teléfono es obligatorio.' })
    .trim()
    .min(6, 'Teléfono demasiado corto.')
    .max(40, 'Teléfono demasiado largo.')
    .refine((v) => {
      const digits = v.replace(/\D/g, '');
      return digits.length >= 8 && digits.length <= 15;
    }, 'Ingresá un teléfono o WhatsApp válido (8 a 15 dígitos).'),
  location: z.string().trim().max(160, 'Ubicación demasiado larga.').optional().or(z.literal('')),
  service: z
    .string({ required_error: 'Seleccioná un servicio.' })
    .trim()
    .min(2, 'Seleccioná un servicio.')
    .max(80),
  message: z.string().trim().max(2000, 'El mensaje es demasiado largo.').optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Debés aceptar el tratamiento de datos.' }),
  }),
  estimatedKg: z.coerce
    .number()
    .min(0, 'La cantidad no puede ser negativa.')
    .max(10_000_000, 'La cantidad es demasiado alta.')
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const d = schema.parse(body);
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
      const fields: Record<string, string> = {};
      for (const issue of e.issues) {
        const key = String(issue.path[0] || '');
        if (key && !fields[key]) fields[key] = issue.message;
      }
      const first = e.issues[0]?.message || 'Revisá los datos ingresados.';
      return NextResponse.json(
        {
          error: first,
          fields,
          labels: fieldLabels,
        },
        { status: 400 }
      );
    }
    console.error('lead create error', e);
    return NextResponse.json({ error: 'No pudimos guardar la solicitud.' }, { status: 500 });
  }
}
