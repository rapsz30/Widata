const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["tesseract.js"],
  outputFileTracingIncludes: {
    "/**": ["./prisma/dev.db", "./prisma/*"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
