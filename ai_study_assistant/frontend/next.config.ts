import type { NextConfig } from "next";

const isGalleryDemo = process.env.NEXT_PUBLIC_DEMO === "true";

const nextConfig: NextConfig = isGalleryDemo
  ? {
      output: "export",
      basePath: "/projects/cortex",
      assetPrefix: "/projects/cortex",
      images: { unoptimized: true },
      trailingSlash: true,
    }
  : {
      async rewrites() {
        return [
          {
            source: "/api/:path*",
            destination: "http://127.0.0.1:5002/api/:path*",
          },
        ];
      },
    };

export default nextConfig;
