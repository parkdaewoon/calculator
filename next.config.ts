import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: "/service",
        destination: "/sources",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "nokobridge.com",
          },
        ],
        destination: "https://www.nokobridge.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;