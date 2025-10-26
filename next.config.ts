/** @type {import('next').NextConfig} */
const nextConfig = {
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
