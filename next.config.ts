/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '172.191.94.124',
        port: '8000',
        pathname: '/media/**',
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