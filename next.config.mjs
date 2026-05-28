/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Allow any HTTPS image URL (covers external product/team logo images)
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
