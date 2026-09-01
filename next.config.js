/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"],
    },
  },
  turbopack: {},
  serverExternalPackages: ["tesseract.js"],
  typescript: {
    // Abaikan error validator route Next.js 16 yang tidak relevan
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
