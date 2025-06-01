/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for better compatibility
  webpack: (config, { dev, isServer }) => {
    // Fix exports issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Improve chunk splitting for better loading
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: false,
  },

  // External packages configuration
  serverExternalPackages: ['@prisma/client'],

  // Image configuration
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  // Disable problematic features for Replit
  swcMinify: false,

  // Output configuration
  output: 'standalone',

  // Disable static optimization to prevent hydration issues
  trailingSlash: false,
  // Fix for development CORS issues
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Better dev server configuration
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;