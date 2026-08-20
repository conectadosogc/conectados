import type { NextConfig } from "next";

function getRemotePattern(rawUrl: string | undefined) {
  if (!rawUrl?.trim()) return null;

  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}

const remotePatterns = [getRemotePattern(process.env.R2_PUBLIC_BASE_URL), getRemotePattern(process.env.R2_BUCKET_URL)].filter(
  (value): value is { protocol: "http" | "https"; hostname: string } => Boolean(value),
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
