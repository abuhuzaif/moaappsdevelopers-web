/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // Next.js 15+/16 blocks dev-server requests from origins it doesn't
  // recognize (a security default). If you're testing from another
  // device on your network via your machine's LAN IP, add it here.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.101'],
};

export default nextConfig;
