import type { MetadataRoute } from 'next';

function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://metalya-ok.vercel.app';
  try {
    return new URL(raw).origin;
  } catch {
    return 'https://metalya-ok.vercel.app';
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/precios`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
