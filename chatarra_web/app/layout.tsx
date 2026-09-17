import type { Metadata, Viewport } from 'next';
import './globals.css';

function safeSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.metalyachatarra.com.ar';
  try {
    const u = new URL(raw);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.origin;
  } catch {
    /* ignore */
  }
  return 'https://www.metalyachatarra.com.ar';
}
const siteUrl = safeSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MetalYa | Compra de chatarra y limpieza de galpones en Buenos Aires',
    template: '%s | MetalYa',
  },
  description:
    'MetalYa compra chatarra, metales, motores y rezagos. Retiro y limpieza de galpones, fabricas, talleres, depositos y pymes en Buenos Aires y alrededores. Cotiza tu lote sin compromiso.',
  keywords: [
    'compra de chatarra',
    'chatarra Buenos Aires',
    'retiro de chatarra',
    'limpieza de galpones',
    'rezagos industriales',
    'compra de cobre',
    'compra de motores',
    'compra de aluminio',
    'vaciado de deposito',
    'reciclaje de metales',
  ],
  authors: [{ name: 'MetalYa' }],
  creator: 'MetalYa',
  openGraph: {
    title: 'MetalYa | Convertimos tu chatarra en valor',
    description:
      'Compra, retiro y limpieza de chatarra y rezagos industriales para empresas y particulares en Buenos Aires.',
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'MetalYa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetalYa | Compra de chatarra en Buenos Aires',
    description: 'Cotiza tu lote de chatarra, motores o rezagos. Retiro coordinado.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#151713',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaRaw = process.env.NEXT_PUBLIC_GA_ID || '';
  const ga = /^G-[A-Z0-9]+$/i.test(gaRaw.trim()) ? gaRaw.trim() : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MetalYa',
    description:
      'Compra de chatarra, metales, motores y rezagos. Retiro y limpieza de galpones, fabricas y pymes en Buenos Aires.',
    url: siteUrl,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Buenos Aires',
    },
    serviceType: [
      'Compra de chatarra',
      'Retiro de metales',
      'Limpieza de galpones',
      'Limpieza industrial',
    ],
  };

  return (
    <html lang="es-AR">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {ga && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
