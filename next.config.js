/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to successfully complete even if project has TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if project has ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'ext.same-assets.com',
      'ugc.same-assets.com',
      'source.unsplash.com',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ugc.same-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
