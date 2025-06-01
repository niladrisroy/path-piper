
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
  
  // Allow dev origins for Replit
  experimental: {
    allowedDevOrigins: [
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.repl\.co$/,
    ],
    optimizeCss: false,
    optimizePackageImports: ['@prisma/client'],
  },

  // External packages configuration (fixed from serverComponentsExternalPackages)
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

  // Output configuration for better compatibility
  output: 'standalone',

  // Image configuration
  images: {
    domains: ['*.replit.dev', '*.repl.co'],
    unoptimized: true,
  },
};

export default nextConfig;
