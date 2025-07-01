/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: [
    '74f7eb31-b1cd-42e1-bc33-49105efe81c2-00-2sp4lhr2dgh9s.sisko.replit.dev',
    'localhost:3000'
  ],
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  images: {
    domains: ['localhost', '74f7eb31-b1cd-42e1-bc33-49105efe81c2-00-2sp4lhr2dgh9s.sisko.replit.dev'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // OPTIMIZED: Add compression and caching
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig