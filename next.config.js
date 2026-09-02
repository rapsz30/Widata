const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"],
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["tesseract.js"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
