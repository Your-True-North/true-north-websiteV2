/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, 'app/lib'),
    }
    return config
  },
}

module.exports = nextConfig
