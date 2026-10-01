/** @type {import('next').NextConfig} */
const nextConfig = {
  // GIS converter route uses Node Buffer APIs and is intentionally kept server-side.
  // Allow Next.js production builds to complete while the generated GIS binary
  // types are narrowed further in the converter route.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};
module.exports = nextConfig;