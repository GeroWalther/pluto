/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // UploadThing serves both hosts depending on account age.
      { protocol: 'https', hostname: '**.ufs.sh', pathname: '/**' },
      { protocol: 'https', hostname: 'utfs.io', pathname: '/**' },
      // Seed data for the demo catalogue.
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'fastly.picsum.photos', pathname: '/**' },
      // OAuth avatars.
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
