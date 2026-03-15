import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taejawold.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/plaza', '/shop', '/notices'],
        disallow: [
          '/api/',
          '/admin/',
          '/(auth)/',
          '/(main)/profile',
          '/(main)/inventory',
          '/(main)/friends',
          '/(main)/minihome',
          '/(main)/broadcast',
          '/(main)/report',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0.1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
