'use client';
import { FormEvent, useState } from 'react';
import ImpactBanner from './components/ImpactBanner';
import RevealInit from './components/Reveal';
const services=['Compra de chatarra','Limpieza de galpón','Limpieza de fábrica','Retiro industrial','Vaciado de depósito','Otro'];
const materials=['Hierro y acero','Cobre','Aluminio','Bronce','Acero inoxidable','Motores eléctricos','Cable de cobre','Chapa','Lote mixto'];
export default function Home(){
 const [sent,setSent]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[whatsappUrl,setWhatsappUrl]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  setError('');
  setLoading(true);
  const form=e.currentTarget;
  const f=new FormData(form);
  const files=(f.getAll('photos').filter((x):x is File=>x instanceof File&&x.size>0));
  const payload={
    name:String(f.get('name')||''),
    company:String(f.get('company')||''),
    email:String(f.get('email')||''),
    phone:String(f.get('phone')||''),
    location:String(f.get('location')||''),
    service:String(f.get('service')||''),
    message:String(f.get('message')||''),
    estimatedKg:f.get('estimatedKg')?Number(f.get('estimatedKg')):undefined,
    consent:f.get('consent')==='on',
  };
  try{
    const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const j=await r.json();
    if(!r.ok)throw Error(j.error||'Error');
    if(files.length){
      const up=new FormData();
      up.append('leadId',j.id);
      files.forEach(file=>up.append('photos',file));
      await fetch('/api/upload',{method:'POST',body:up});
    }
    if(j.whatsapp) setWhatsappUrl(j.whatsapp);
    setSent(true);
  }catch(err){
    setError(err instanceof Error?err.message:'Error de conexión.');
  }finally{
    setLoading(false);
  }
 }

 return <main>
 <RevealInit />
 <header className="nav"><a className="brand" href="#top" aria-label="MetalYa inicio"><img className="markImg" src="/icon.svg" width={34} height={34} alt=""/><span>Metal<span>Ya</span></span></a><nav><a href="#servicios">Servicios</a><a href="/precios">Precios</a><a href="#proceso">Cómo funciona</a><a href="#empresas">Empresas</a><a href="#cotizar" className="navCta">Cotizar retiro</a></nav></header>
 <section id="top" className="hero"><div className="heroCopy"><div className="pill">♻ COMPRA · RETIRO · LIMPIEZA</div><h1>Tu chatarra ocupa espacio.<br/><em>Nosotros la convertimos en valor.</em></h1><p>Compramos metales, motores y rezagos. Retiramos material de galpones, fábricas, talleres, depósitos y pymes.</p><div className="actions"><a className="btn primary" href="#cotizar">Cotizar mi lote →</a><a className="btn ghost" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "5491100000000"}?text=${encodeURIComponent("Hola MetalYa, quiero cotizar un lote")}`} target="_blank" rel="noreferrer">WhatsApp</a></div><div className="trust"><b>✓ Evaluación por lote</b><b>✓ Retiros coordinados</b><b>✓ Atención a empresas</b></div></div><div className="heroCard"><div className="cardGlow"/><div className="scrapIcon">⚙</div><h3>¿Tenés un lote?</h3><p>Mandanos fotos, material, cantidad aproximada y ubicación.</p><a href="#cotizar">Quiero tasarlo →</a><div className="mini">Sin compromiso · respuesta comercial</div></div></section>
 <section className="stats reveal"><div><strong>01</strong><span>Evaluamos</span></div><div><strong>02</strong><span>Cotizamos</span></div><div><strong>03</strong><span>Retiramos</span></div><div><strong>04</strong><span>Pesamos y clasificamos</span></div></section>
 <ImpactBanner />
 <section id="servicios" className="section reveal"><div className="eyebrow">QUÉ HACEMOS</div><h2>Un solo proveedor para <span>ordenar y recuperar valor.</span></h2><div className="grid">{[['\u267b','Compra de chatarra','Hierro, aluminio, cobre, bronce, acero inoxidable y metales recuperables.'],['\u25a3','Limpieza de galpones','Vaciado de rezagos, estructuras, m\u00e1quinas y material acumulado.'],['\u2302','Limpieza de f\u00e1bricas y pymes','Despeje de plantas, talleres, dep\u00f3sitos y comercios.'],['\u2197','Retiros por volumen','Evaluamos desde lotes peque\u00f1os hasta operaciones industriales.'],['\u2699','Motores y maquinaria','Compramos motores el\u00e9ctricos, m\u00e1quinas y equipos fuera de uso.'],['\u25a4','Rezagos industriales','Clasificaci\u00f3n y retiro de materiales que ya no forman parte de tu operaci\u00f3n.']].map(x=><article className="service" key={x[1]}><div className="serviceIcon">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
 <section id="proceso" className="dark reveal"><div className="eyebrow">SIMPLE Y DIRECTO</div><h2>Del descarte al espacio libre.</h2><div className="steps"><div className="reveal delay1"><i>01</i><h3>Sub\u00eds tu solicitud</h3><p>Material, fotos, cantidad aproximada y ubicaci\u00f3n.</p></div><div className="reveal delay2"><i>02</i><h3>Analizamos el lote</h3><p>Estimamos composici\u00f3n, valor recuperable y log\u00edstica.</p></div><div className="reveal delay3"><i>03</i><h3>Coordinamos el retiro</h3><p>Definimos d\u00eda, horario y modalidad sin frenar tu actividad.</p></div></div></section>
 <section id="empresas" className="section split reveal"><div><div className="eyebrow">PARA EMPRESAS</div><h2>\u00bfTen\u00e9s un galp\u00f3n que necesit\u00e1s <span>liberar?</span></h2><p className="lead">MetalYa est\u00e1 pensado para operaciones donde hay volumen, materiales mezclados y poco tiempo para ocuparse del retiro.</p><ul className="checks"><li>Clasificaci\u00f3n y retiro de materiales</li><li>Operaciones recurrentes por volumen</li><li>Coordinaci\u00f3n con responsables de planta</li><li>Evaluaci\u00f3n de lotes completos</li><li>Posibilidad de compensar el servicio con material recuperable, seg\u00fan operaci\u00f3n</li></ul><a className="btn primary" href="#cotizar">Solicitar visita \u2192</a></div><div className="quoteBox"><div className="bigNumber">$</div><b>\u00bfNo sab\u00e9s cu\u00e1nto vale?</b><p>No necesit\u00e1s clasificar todo antes de consultarnos. Con fotos y una descripci\u00f3n inicial podemos orientarte.</p><a href="#cotizar">Enviar fotos del lote \u2192</a></div></section>
 <section className="materialSection reveal"><div className="eyebrow">MATERIALES</div><h2>Decinos qu\u00e9 ten\u00e9s. <span>Nosotros hacemos el an\u00e1lisis.</span></h2><div className="chips">{materials.map(m=><span key={m}>{m}</span>)}</div></section>
 <section id="cotizar" className="contact"><div><div className="eyebrow">COTIZACI\u00d3N</div><h2>Contanos qu\u00e9 quer\u00e9s retirar.</h2><p>Complet\u00e1 el formulario. La informaci\u00f3n queda registrada para que podamos gestionar tu consulta.</p><div className="contactNote"><b>\u00bfEs una empresa?</b><span>Indic\u00e1 el nombre y ubicaci\u00f3n del establecimiento para acelerar la evaluaci\u00f3n.</span></div><div className="mapCard" id="zona"><div><b>Zona de atenci\u00f3n</b><span>CABA, GBA Norte, Sur y Oeste \u00b7 coordinamos retiros por volumen</span></div><a href="https://www.google.com/maps/search/Buenos+Aires+Argentina" target="_blank" rel="noreferrer">Ver en Maps \u2197</a></div>
<iframe title="Zona MetalYa Buenos Aires" className="zoneMap" src="https://maps.google.com/maps?q=Buenos%20Aires%20Argentina&t=&z=10&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><div className="formCard">{sent?<div className="success"><div>\u2713</div><h3>Solicitud recibida.</h3><p>Ya registramos tus datos. Te vamos a contactar para avanzar con la evaluaci\u00f3n.</p>{whatsappUrl&&<p style={{marginTop:16}}><a className="btn primary" href={whatsappUrl} target="_blank" rel="noreferrer">Continuar por WhatsApp \u2192</a></p>}<button onClick={()=>setSent(false)}>Enviar otra consulta</button></div>:<form onSubmit={submit}><div className="two"><label>Nombre*<input name="name" required placeholder="Tu nombre"/></label><label>Empresa<input name="company" placeholder="Empresa / pyme"/></label></div><div className="two"><label>Tel\u00e9fono / WhatsApp*<input name="phone" required placeholder="11 1234 5678"/></label><label>Email<input name="email" type="email" placeholder="nombre@empresa.com"/></label></div><div className="two"><label>Ubicaci\u00f3n<input name="location" placeholder="Localidad / zona"/></label><label>Cantidad aprox. (kg)<input name="estimatedKg" type="number" min="0" placeholder="Ej. 800"/></label></div><label>Necesit\u00e1s*<select name="service" defaultValue="Compra de chatarra">{services.map(s=><option key={s}>{s}</option>)}</select></label><label>Contanos qu\u00e9 ten\u00e9s<textarea name="message" rows={4} placeholder="Ej.: motores, chapas, perfiles, cables, maquinaria..."/></label><label>Fotos del lote<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>Hasta 6 fotos \u00b7 JPG, PNG o WebP \u00b7 5 MB por foto</small></label><label className="consent"><input name="consent" type="checkbox" required/> Acepto que MetalYa almacene estos datos para responder y gestionar mi solicitud.</label>{error&&<p className="error">{error}</p>}<button className="btn primary full" disabled={loading}>{loading?'Enviando...':'Solicitar cotizaci\u00f3n \u2192'}</button><small>Tratamos tus datos \u00fanicamente para gestionar la consulta y prestar el servicio. No cargues informaci\u00f3n sensible.</small></form>}</div></section>
 <footer><div className="brand"><img className="markImg" src="/icon.svg" width={34} height={34} alt=""/><span>Metal<span>Ya</span></span></div><p>Compra de chatarra \u00b7 Retiros \u00b7 Limpieza industrial</p><div><a href="/precios">Precios</a> \u00b7 <a href="#cotizar">Contacto</a> \u00b7 <a href="/privacidad">Privacidad</a> \u00b7 <a href="/admin">Panel</a></div></footer>
 </main>
}
