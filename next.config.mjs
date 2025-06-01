/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [],
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  trailingSlash: false,
  async rewrites() {
    return []
  },
}

export default nextConfig