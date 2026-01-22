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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
      });
    }
    return config;
  },
  turbopack: {
    root: "c:/Users/tomoy/Desktop/program code/real-shop-app V2",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default withPWA(nextConfig);
