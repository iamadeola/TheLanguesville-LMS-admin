import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
