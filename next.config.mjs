
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
  // Experimental features for Replit compatibility
  experimental: {
    optimizeCss: false,
  },

  // External packages configuration
  serverExternalPackages: ['@prisma/client'],

  // Webpack configuration for better chunk handling
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
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
        },
      };
    }
    return config;
  },

  // Image configuration
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  // Disable static optimization for better Replit compatibility
  trailingSlash: false,
  
  // Better dev server configuration
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
