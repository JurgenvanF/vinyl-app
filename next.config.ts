import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid Turbopack inferring a parent workspace root when multiple lockfiles exist.
    root: __dirname,
  },
};

export default nextConfig;
