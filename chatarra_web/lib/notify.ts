/**
 * Notificaciones opcionales: email (Resend) y links de WhatsApp.
 * Si no hay API keys, las funciones no fallan: solo no envían.
 */

const wa = () => (process.env.NEXT_PUBLIC_WHATSAPP || process.env.WHATSAPP || '5491100000000').replace(/\D/g, '');

export function whatsappLink(text: string) {
  return `https://wa.me/${wa()}?text=${encodeURIComponent(text)}`;
}

export function leadWhatsAppMessage(d: {
  name: string;
  phone: string;
  company?: string | null;
  location?: string | null;
  service?: string;
  estimatedKg?: number | null;
}) {
  const parts = [
    `Hola ${d.name}, soy de MetalYa.`,
    `Recibimos tu consulta${d.service ? ` de ${d.service}` : ''}.`,
    d.estimatedKg ? `Kg aprox.: ${d.estimatedKg}.` : '',
    d.location ? `Zona: ${d.location}.` : '',
    '¿Cuándo te viene bien que te contactemos?',
  ].filter(Boolean);
  return parts.join(' ');
}

export function adminLeadAlertMessage(d: {
  name: string;
  phone: string;
  company?: string | null;
  location?: string | null;
  service?: string;
  message?: string | null;
  estimatedKg?: number | null;
  id: string;
}) {
  return [
    `🔔 Nuevo lead MetalYa`,
    `${d.name}${d.company ? ` (${d.company})` : ''}`,
    `Tel: ${d.phone}`,
    d.service ? `Servicio: ${d.service}` : '',
    d.location ? `Zona: ${d.location}` : '',
    d.estimatedKg != null ? `Kg: ${d.estimatedKg}` : '',
    d.message ? `Msg: ${d.message.slice(0, 200)}` : '',
    `ID: ${d.id}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Email vía Resend si RESEND_API_KEY y NOTIFY_EMAIL están configurados */
export async function sendEmailNotify(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM || 'MetalYa <onboarding@resend.dev>';
  if (!key || !to) return { sent: false, reason: 'missing_config' as const };

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
      }),
    });
    if (!r.ok) {
      console.error('Resend error', await r.text());
      return { sent: false, reason: 'api_error' as const };
    }
    return { sent: true as const };
  } catch (e) {
    console.error('email notify', e);
    return { sent: false, reason: 'exception' as const };
  }
}

export async function notifyNewLead(d: {
  id: string;
  name: string;
  phone: string;
  company?: string | null;
  location?: string | null;
  service?: string;
  message?: string | null;
  estimatedKg?: number | null;
}) {
  const text = adminLeadAlertMessage(d);
  await sendEmailNotify(`[MetalYa] Nuevo lead: ${d.name}`, text);
  return { whatsappAdmin: whatsappLink(text) };
}
