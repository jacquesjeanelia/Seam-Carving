/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow Google Fonts and related domains
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
      },
    ],
    // Disable image optimization for development if needed
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/public/uploads/:path*',
      },
      {
        source: '/outputs/:path*',
        destination: '/public/outputs/:path*',
      },
    ]
  },
  
  // Configure headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // CORS headers for API routes
      {
        source: '/api/:path*',
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
      // Headers for font preloading and CORS
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Configure webpack if needed
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    return config
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Configure redirects if needed
  async redirects() {
    return []
  },
  
  // Configure output for static export if needed
  // output: 'export',
  // trailingSlash: true,
  
  // Configure TypeScript checking
  typescript: {
    // Set to true to ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },
  
  // Configure ESLint checking
  eslint: {
    // Set to true to ignore ESLint errors during build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
