'use client';

import { FormEvent, useState } from 'react';
import ImpactBanner from './components/ImpactBanner';
import RevealInit from './components/Reveal';

const t = {
  services: [
    'Compra de chatarra',
    'Limpieza de galp\u00f3n',
    'Limpieza de f\u00e1brica',
    'Retiro industrial',
    'Vaciado de dep\u00f3sito',
    'Otro',
  ],
  materials: [
    'Hierro y acero',
    'Cobre',
    'Aluminio',
    'Bronce',
    'Acero inoxidable',
    'Motores el\u00e9ctricos',
    'Cable de cobre',
    'Chapa',
    'Lote mixto',
  ],
  navHow: 'C\u00f3mo funciona',
  pill: '\u267b COMPRA \u00b7 RETIRO \u00b7 LIMPIEZA',
  heroP:
    'Compramos metales, motores y rezagos. Retiramos material de galpones, f\u00e1bricas, talleres, dep\u00f3sitos y pymes.',
  ctaQuote: 'Cotizar mi lote \u2192',
  trust1: '\u2713 Evaluaci\u00f3n por lote',
  trust2: '\u2713 Retiros coordinados',
  trust3: '\u2713 Atenci\u00f3n a empresas',
  heroCardTitle: '\u00bfTen\u00e9s un lote?',
  heroCardP: 'Mandanos fotos, material, cantidad aproximada y ubicaci\u00f3n.',
  heroCardCta: 'Quiero tasarlo \u2192',
  whatWeDo: 'QU\u00c9 HACEMOS',
  serviceItems: [
    ['\u267b', 'Compra de chatarra', 'Hierro, aluminio, cobre, bronce, acero inoxidable y metales recuperables.'],
    ['\u25a3', 'Limpieza de galpones', 'Vaciado de rezagos, estructuras, m\u00e1quinas y material acumulado.'],
    ['\u2302', 'Limpieza de f\u00e1bricas y pymes', 'Despeje de plantas, talleres, dep\u00f3sitos y comercios.'],
    ['\u2197', 'Retiros por volumen', 'Evaluamos desde lotes peque\u00f1os hasta operaciones industriales.'],
    ['\u2699', 'Motores y maquinaria', 'Compramos motores el\u00e9ctricos, m\u00e1quinas y equipos fuera de uso.'],
    ['\u25a4', 'Rezagos industriales', 'Clasificaci\u00f3n y retiro de materiales que ya no forman parte de tu operaci\u00f3n.'],
  ],
  step1Title: 'Sub\u00eds tu solicitud',
  step1P: 'Material, fotos, cantidad aproximada y ubicaci\u00f3n.',
  step2Title: 'Analizamos el lote',
  step2P: 'Estimamos composici\u00f3n, valor recuperable y log\u00edstica.',
  step3Title: 'Coordinamos el retiro',
  step3P: 'Definimos d\u00eda, horario y modalidad sin frenar tu actividad.',
  bizTitleBefore: '\u00bfTen\u00e9s un galp\u00f3n que necesit\u00e1s',
  bizLead:
    'MetalYa est\u00e1 pensado para operaciones donde hay volumen, materiales mezclados y poco tiempo para ocuparse del retiro.',
  checks: [
    'Clasificaci\u00f3n y retiro de materiales',
    'Operaciones recurrentes por volumen',
    'Coordinaci\u00f3n con responsables de planta',
    'Evaluaci\u00f3n de lotes completos',
    'Posibilidad de compensar el servicio con material recuperable, seg\u00fan operaci\u00f3n',
  ],
  visitCta: 'Solicitar visita \u2192',
  quoteTitle: '\u00bfNo sab\u00e9s cu\u00e1nto vale?',
  quoteP:
    'No necesit\u00e1s clasificar todo antes de consultarnos. Con fotos y una descripci\u00f3n inicial podemos orientarte.',
  quoteCta: 'Enviar fotos del lote \u2192',
  matTitle: 'Decinos qu\u00e9 ten\u00e9s.',
  matSpan: 'Nosotros hacemos el an\u00e1lisis.',
  quoteSection: 'COTIZACI\u00d3N',
  formTitle: 'Contanos qu\u00e9 quer\u00e9s retirar.',
  formLead:
    'Complet\u00e1 el formulario. La informaci\u00f3n queda registrada para que podamos gestionar tu consulta.',
  isCompany: '\u00bfEs una empresa?',
  isCompanyHint: 'Indic\u00e1 el nombre y ubicaci\u00f3n del establecimiento para acelerar la evaluaci\u00f3n.',
  zoneTitle: 'Zona de atenci\u00f3n',
  zoneHint: 'CABA, GBA Norte, Sur y Oeste \u00b7 coordinamos retiros por volumen',
  maps: 'Ver en Maps \u2197',
  successTitle: 'Solicitud recibida.',
  successP: 'Ya registramos tus datos. Te vamos a contactar para avanzar con la evaluaci\u00f3n.',
  waContinue: 'Continuar por WhatsApp \u2192',
  phoneLabel: 'Tel\u00e9fono / WhatsApp*',
  locationLabel: 'Ubicaci\u00f3n',
  needLabel: 'Necesit\u00e1s*',
  tellUs: 'Contanos qu\u00e9 ten\u00e9s',
  submit: 'Solicitar cotizaci\u00f3n \u2192',
  privacy:
    'Tratamos tus datos \u00fanicamente para gestionar la consulta y prestar el servicio. No cargues informaci\u00f3n sensible.',
  footer: 'Compra de chatarra \u00b7 Retiros \u00b7 Limpieza industrial',
};

function onlyDigits(s: string) {
  return s.replace(/\D/g, '');
}

function validateClient(payload: {
  name: string;
  phone: string;
  email: string;
  estimatedKg?: number;
  consent: boolean;
  message: string;
  files: File[];
}): string | null {
  if (payload.name.trim().length < 2) return 'Ingres\u00e1 tu nombre (m\u00ednimo 2 caracteres).';
  const digits = onlyDigits(payload.phone);
  if (digits.length < 8 || digits.length > 15) {
    return 'Ingres\u00e1 un tel\u00e9fono o WhatsApp v\u00e1lido (8 a 15 d\u00edgitos).';
  }
  if (payload.email && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(payload.email)) {
    return 'El email no tiene un formato v\u00e1lido.';
  }
  if (payload.estimatedKg != null && (Number.isNaN(payload.estimatedKg) || payload.estimatedKg < 0)) {
    return 'La cantidad estimada en kg no puede ser negativa.';
  }
  if (payload.estimatedKg != null && payload.estimatedKg > 10_000_000) {
    return 'La cantidad estimada es demasiado alta.';
  }
  if (!payload.consent) return 'Deb\u00e9s aceptar el tratamiento de datos para continuar.';
  if (payload.message.length > 2000) return 'El mensaje es demasiado largo (m\u00e1x. 2000 caracteres).';
  if (payload.files.length > 6) return 'Pod\u00e9s subir hasta 6 fotos.';
  for (const file of payload.files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Solo se admiten fotos JPG, PNG o WebP.';
    }
    if (file.size > 5 * 1024 * 1024) return 'Cada foto debe pesar como m\u00e1ximo 5 MB.';
  }
  return null;
}

export default function Home() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const form = e.currentTarget;
    const f = new FormData(form);
    const files = f.getAll('photos').filter((x): x is File => x instanceof File && x.size > 0);

    const payload = {
      name: String(f.get('name') || '').trim(),
      company: String(f.get('company') || '').trim(),
      email: String(f.get('email') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      location: String(f.get('location') || '').trim(),
      service: String(f.get('service') || ''),
      message: String(f.get('message') || '').trim(),
      estimatedKg: f.get('estimatedKg') ? Number(f.get('estimatedKg')) : undefined,
      consent: f.get('consent') === 'on',
    };

    const clientErr = validateClient({ ...payload, files });
    if (clientErr) {
      setError(clientErr);
      setLoading(false);
      return;
    }

    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) {
        if (j.fields && typeof j.fields === 'object') {
          setFieldErrors(j.fields as Record<string, string>);
        }
        throw Error(j.error || 'Error al enviar');
      }
      if (files.length) {
        const up = new FormData();
        up.append('leadId', j.id);
        files.forEach((file) => up.append('photos', file));
        await fetch('/api/upload', { method: 'POST', body: up });
      }
      if (j.whatsapp) setWhatsappUrl(j.whatsapp);
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexi\u00f3n.');
    } finally {
      setLoading(false);
    }
  }

  const wa = process.env.NEXT_PUBLIC_WHATSAPP || '5491100000000';

  return (
    <main>
      <RevealInit />
      <header className="nav">
        <a className="brand" href="#top" aria-label="MetalYa inicio">
          <img className="markImg" src="/icon.svg" width={34} height={34} alt="" />
          <span>
            Metal<span>Ya</span>
          </span>
        </a>
        <nav>
          <a href="#servicios">Servicios</a>
          <a href="/precios">Precios</a>
          <a href="#proceso">{t.navHow}</a>
          <a href="#empresas">Empresas</a>
          <a href="#cotizar" className="navCta">
            Cotizar retiro
          </a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="heroCopy">
          <div className="pill">{t.pill}</div>
          <h1>
            Tu chatarra ocupa espacio.
            <br />
            <em>Nosotros la convertimos en valor.</em>
          </h1>
          <p>{t.heroP}</p>
          <div className="actions">
            <a className="btn primary" href="#cotizar">
              {t.ctaQuote}
            </a>
            <a
              className="btn ghost"
              href={`https://wa.me/${wa}?text=${encodeURIComponent('Hola MetalYa, quiero cotizar un lote')}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
          <div className="trust">
            <b>{t.trust1}</b>
            <b>{t.trust2}</b>
            <b>{t.trust3}</b>
          </div>
        </div>
        <div className="heroCard">
          <div className="cardGlow" />
          <div className="scrapIcon">{'\u2699'}</div>
          <h3>{t.heroCardTitle}</h3>
          <p>{t.heroCardP}</p>
          <a href="#cotizar">{t.heroCardCta}</a>
          <div className="mini">{'Sin compromiso \u00b7 respuesta comercial'}</div>
        </div>
      </section>

      <section className="stats reveal">
        <div>
          <strong>01</strong>
          <span>Evaluamos</span>
        </div>
        <div>
          <strong>02</strong>
          <span>Cotizamos</span>
        </div>
        <div>
          <strong>03</strong>
          <span>Retiramos</span>
        </div>
        <div>
          <strong>04</strong>
          <span>Pesamos y clasificamos</span>
        </div>
      </section>

      <ImpactBanner />

      <section id="servicios" className="section reveal">
        <div className="eyebrow">{t.whatWeDo}</div>
        <h2>
          Un solo proveedor para <span>ordenar y recuperar valor.</span>
        </h2>
        <div className="grid">
          {t.serviceItems.map((x) => (
            <article className="service" key={x[1]}>
              <div className="serviceIcon">{x[0]}</div>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="proceso" className="dark reveal">
        <div className="eyebrow">SIMPLE Y DIRECTO</div>
        <h2>Del descarte al espacio libre.</h2>
        <div className="steps">
          <div className="reveal delay1">
            <i>01</i>
            <h3>{t.step1Title}</h3>
            <p>{t.step1P}</p>
          </div>
          <div className="reveal delay2">
            <i>02</i>
            <h3>{t.step2Title}</h3>
            <p>{t.step2P}</p>
          </div>
          <div className="reveal delay3">
            <i>03</i>
            <h3>{t.step3Title}</h3>
            <p>{t.step3P}</p>
          </div>
        </div>
      </section>

      <section id="empresas" className="section split reveal">
        <div>
          <div className="eyebrow">PARA EMPRESAS</div>
          <h2>
            {t.bizTitleBefore} <span>liberar?</span>
          </h2>
          <p className="lead">{t.bizLead}</p>
          <ul className="checks">
            {t.checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <a className="btn primary" href="#cotizar">
            {t.visitCta}
          </a>
        </div>
        <div className="quoteBox">
          <div className="bigNumber">$</div>
          <b>{t.quoteTitle}</b>
          <p>{t.quoteP}</p>
          <a href="#cotizar">{t.quoteCta}</a>
        </div>
      </section>

      <section className="materialSection reveal">
        <div className="eyebrow">MATERIALES</div>
        <h2>
          {t.matTitle} <span>{t.matSpan}</span>
        </h2>
        <div className="chips">
          {t.materials.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </section>

      <section id="cotizar" className="contact">
        <div>
          <div className="eyebrow">{t.quoteSection}</div>
          <h2>{t.formTitle}</h2>
          <p>{t.formLead}</p>
          <div className="contactNote">
            <b>{t.isCompany}</b>
            <span>{t.isCompanyHint}</span>
          </div>
          <div className="mapCard" id="zona">
            <div>
              <b>{t.zoneTitle}</b>
              <span>{t.zoneHint}</span>
            </div>
            <a
              href="https://www.google.com/maps/search/Buenos+Aires+Argentina"
              target="_blank"
              rel="noreferrer"
            >
              {t.maps}
            </a>
          </div>
          <iframe
            title="Zona MetalYa Buenos Aires"
            className="zoneMap"
            src="https://maps.google.com/maps?q=Buenos%20Aires%20Argentina&t=&z=10&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="formCard">
          {sent ? (
            <div className="success">
              <div>{'\u2713'}</div>
              <h3>{t.successTitle}</h3>
              <p>{t.successP}</p>
              {whatsappUrl && (
                <p style={{ marginTop: 16 }}>
                  <a className="btn primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                    {t.waContinue}
                  </a>
                </p>
              )}
              <button type="button" onClick={() => setSent(false)}>
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="two">
                <label>
                  Nombre*
                  <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Tu nombre" />
                  {fieldErrors.name && <small className="error">{fieldErrors.name}</small>}
                </label>
                <label>
                  Empresa
                  <input name="company" maxLength={120} autoComplete="organization" placeholder="Empresa / pyme" />
                </label>
              </div>
              <div className="two">
                <label>
                  {t.phoneLabel}
                  <input name="phone" required minLength={8} maxLength={40} inputMode="tel" autoComplete="tel" placeholder="11 1234 5678" pattern="[\\d\\s\\-+()]{8,40}" />
                  {fieldErrors.phone && <small className="error">{fieldErrors.phone}</small>}
                </label>
                <label>
                  Email
                  <input name="email" type="email" maxLength={160} autoComplete="email" placeholder="nombre@empresa.com" />
                  {fieldErrors.email && <small className="error">{fieldErrors.email}</small>}
                </label>
              </div>
              <div className="two">
                <label>
                  {t.locationLabel}
                  <input name="location" maxLength={160} placeholder="Localidad / zona" />
                </label>
                <label>
                  Cantidad aprox. (kg)
                  <input name="estimatedKg" type="number" min={0} max={10000000} step={1} placeholder="Ej. 800" />
                </label>
              </div>
              <label>
                {t.needLabel}
                <select name="service" defaultValue="Compra de chatarra" required>
                  {t.services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                {t.tellUs}
                <textarea name="message" rows={4} maxLength={2000} placeholder="Ej.: motores, chapas, perfiles, cables, maquinaria..." />
              </label>
              <label>
                Fotos del lote
                <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
                <small>{'Hasta 6 fotos \u00b7 JPG, PNG o WebP \u00b7 5 MB por foto'}</small>
              </label>
              <label className="consent">
                <input name="consent" type="checkbox" required /> Acepto que MetalYa almacene estos datos para responder y gestionar mi solicitud.
              </label>
              {error && <p className="error">{error}</p>}
              <button className="btn primary full" disabled={loading} type="submit">
                {loading ? 'Enviando...' : t.submit}
              </button>
              <small>{t.privacy}</small>
            </form>
          )}
        </div>
      </section>

      <footer>
        <div className="brand">
          <img className="markImg" src="/icon.svg" width={34} height={34} alt="" />
          <span>
            Metal<span>Ya</span>
          </span>
        </div>
        <p>{t.footer}</p>
        <div>
          <a href="/precios">Precios</a> | <a href="#cotizar">Contacto</a> | <a href="/privacidad">Privacidad</a> |{' '}
          <a href="/admin">Panel</a>
        </div>
      </footer>
    </main>
  );
}
