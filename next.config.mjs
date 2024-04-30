/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'utfs.io'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SERVER_URL.split('https://')[1] || '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
