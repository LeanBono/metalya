import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description:
    'Como MetalYa trata los datos personales enviados a traves del formulario de cotizacion y contacto.',
  robots: { index: true, follow: true },
};

export default function Privacidad() {
  return (
    <main className="section" style={{ maxWidth: 720, margin: '0 auto', padding: '60px 28px 100px' }}>
      <div className="eyebrow">PRIVACIDAD</div>
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(32px,5vw,48px)', lineHeight: 1.1 }}>
        Politica de privacidad
      </h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        MetalYa recopila los datos enviados voluntariamente mediante el formulario de contacto para
        responder consultas comerciales, coordinar retiros y preparar cotizaciones.
      </p>

      <h2 style={{ fontFamily: 'Space Grotesk', marginTop: 36 }}>Responsable</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        Razon social / nombre comercial: <strong>MetalYa</strong>
        <br />
        Domicilio: <em>[completar domicilio real]</em>
        <br />
        Contacto: WhatsApp y formulario del sitio web.
      </p>

      <h2 style={{ fontFamily: 'Space Grotesk', marginTop: 36 }}>Que datos guardamos</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        Nombre, empresa (opcional), telefono, email (opcional), ubicacion, tipo de servicio, mensaje y,
        si las envias, fotos del lote. No solicitamos datos sensibles.
      </p>

      <h2 style={{ fontFamily: 'Space Grotesk', marginTop: 36 }}>Finalidad y base legal</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        Los datos se usan exclusivamente para gestionar tu consulta, emitir cotizaciones y coordinar el
        servicio. La base es el consentimiento que otorgas al marcar la casilla del formulario.
      </p>

      <h2 style={{ fontFamily: 'Space Grotesk', marginTop: 36 }}>Conservacion</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        Se conservan durante el tiempo necesario para la relacion comercial o para cumplir obligaciones
        legales.
      </p>

      <h2 style={{ fontFamily: 'Space Grotesk', marginTop: 36 }}>Tus derechos</h2>
      <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
        Podes solicitar acceso, rectificacion o eliminacion de tus datos escribiendo al canal de
        contacto de MetalYa.
      </p>

      <p style={{ color: 'var(--muted)', lineHeight: 1.65, marginTop: 28, fontSize: 14 }}>
        Completa razon social, domicilio y datos de contacto reales antes de recolectar datos en
        produccion.
      </p>

      <a className="btn primary" href="/" style={{ marginTop: 24, display: 'inline-flex' }}>
        Volver al inicio
      </a>
    </main>
  );
}
