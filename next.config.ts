/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local API
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // External API
      {
        protocol: 'http',
        hostname: '172.191.94.124',
        port: '8000',
        pathname: '/media/**',
      },
      // Product images - VTEX
      {
        protocol: 'https',
        hostname: 'hebmx.vtexassets.com',
      },
      // Product images - Smart & Final
      {
        protocol: 'https',
        hostname: 'www.smartnfinal.com.mx',
      },
      // Product images - Vinos y Licores
      {
        protocol: 'https',
        hostname: 'vinosylicores.com',
      },
      // Product images - Cava Sautto
      {
        protocol: 'https',
        hostname: 'www.cavasautto.com',
      },
      // Product images - CarneMART
      {
        protocol: 'https',
        hostname: 'carnemart.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://172.191.94.124:8000/api/:path*',
        basePath: false,
      },
    ];
  },
}

export default nextConfig;
