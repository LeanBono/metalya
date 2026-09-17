# MetalYa V1

Plataforma de compra de chatarra + retiros + limpieza de galpones/fábricas/pymes.

## Incluye
- Landing responsive y SEO local inicial.
- Formulario de cotización con datos de cliente, empresa, ubicación, kg estimados y hasta 6 fotos.
- PostgreSQL + Prisma para leads, lotes, fotos, materiales y cotizaciones.
- Panel `/admin` protegido por contraseña mediante cookie firmada.
- Gestión inicial de materiales y precios internos.
- API para leads, materiales, login, logout, seed y fotos.
- Google Analytics opcional mediante `NEXT_PUBLIC_GA_ID`.
- CTAs de WhatsApp y Google Maps configurables en `app/page.tsx`.

## Puesta en marcha
1. Requiere Node.js 20+ y PostgreSQL.
2. Copiá `.env.example` a `.env` y completá `DATABASE_URL`, `ADMIN_PASSWORD` y `ADMIN_SECRET`.
3. Instalá dependencias: `npm install`.
4. Generá cliente y base: `npx prisma generate && npx prisma db push`.
5. Iniciá: `npm run dev`.
6. Entrá a `/admin`, iniciá sesión y cargá los materiales base.

## Producción
- Usá HTTPS.
- Cambiá `ADMIN_PASSWORD` y `ADMIN_SECRET` por secretos aleatorios fuertes.
- Configurá backups de PostgreSQL.
- El endpoint de fotos V1 guarda archivos en `public/uploads`. En un hosting serverless reemplazalo por almacenamiento persistente (S3/R2/Vercel Blob) antes de producción.
- Completá razón social, domicilio, teléfono, jurisdicción y política de privacidad reales antes de recolectar datos de clientes.
- Configurá dominio, WhatsApp, Google Analytics y Search Console.

## V1.1 — Calculadora y rentabilidad
- Calculadora de lotes dentro de `/admin`.
- Cálculo por material de kg, compra, venta y totales.
- Costos operativos y margen objetivo configurables.
- Cálculo automático de **oferta máxima recomendada**: venta estimada - costos operativos - margen objetivo.
- Ganancia y margen proyectados.
- Historial de cotizaciones y métricas de ganancia proyectada/realizada.
- Los campos `actualSell`, `actualCost` y `actualProfit` permiten registrar resultados reales mediante `PATCH /api/admin/quotes/:id`.

Después de actualizar desde V1, ejecutar `npx prisma db push` para incorporar los nuevos campos.
