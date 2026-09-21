import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  agentRules: false,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@tabler/icons-react"],
  },
}

export default nextConfig
