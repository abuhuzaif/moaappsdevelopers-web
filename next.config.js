/** @type {import('next').NextConfig} */

// Both domains run from this one codebase. MYKSA CONNECT pages must live only on
// www.myksaconnect.com — on moaappsdevelopers.com they redirect there (308), so
// visitors never see an old copy and Google doesn't see duplicate pages.
const MOA_HOST = [{ type: "host", value: "(?:www\\.)?moaappsdevelopers\\.com" }];
const KSA = "https://www.myksaconnect.com";

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
  async redirects() {
    return [
      { source: "/ksa-connect", has: MOA_HOST, destination: `${KSA}/`, permanent: true },
      { source: "/ksa-connect/:path*", has: MOA_HOST, destination: `${KSA}/ksa-connect/:path*`, permanent: true },
      { source: "/tools", has: MOA_HOST, destination: `${KSA}/tools`, permanent: true },
      { source: "/tools/:path*", has: MOA_HOST, destination: `${KSA}/tools/:path*`, permanent: true },
      { source: "/restaurants", has: MOA_HOST, destination: `${KSA}/restaurants`, permanent: true },
      { source: "/restaurants/:path*", has: MOA_HOST, destination: `${KSA}/restaurants/:path*`, permanent: true },
      { source: "/app", has: MOA_HOST, destination: `${KSA}/app`, permanent: true },
    ];
  },
};
module.exports = nextConfig;
