import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Keep your Spotify/Internal API routes private
    },
    sitemap: 'https://focusflow-pb.vercel.app/sitemap.xml',
  }
}