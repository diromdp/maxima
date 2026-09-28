import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  agentRules: false,
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@tabler/icons-react"],
  },
}

export default nextConfig
