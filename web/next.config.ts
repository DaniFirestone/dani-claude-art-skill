import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence the workspace root warning caused by multiple lockfiles in the monorepo
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
