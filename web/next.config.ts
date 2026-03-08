import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Silence the workspace root warning caused by multiple lockfiles in the monorepo
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
