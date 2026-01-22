import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isCapacitor = process.env.CAPACITOR === "true";

const withPWA = withPWAInit({
  dest: "public",
  disable: isCapacitor, // ← Android では必ず PWA 無効
  register: true,
});

const nextConfig: NextConfig = {
  ...(isCapacitor && { output: "export" }), // ← Capacitorビルド時のみstatic export
  images: {
    unoptimized: true, // ← export 必須
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      // Prisma externalization for server-side
      "*.prisma": {
        loaders: ["ignore-loader"],
      },
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default withPWA(nextConfig);
