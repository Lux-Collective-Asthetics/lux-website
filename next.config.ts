import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // React dev mode requires unsafe-eval for call-stack reconstruction; never in production
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://static.cloudflareinsights.com https://challenges.cloudflare.com https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https://ukmyjostwftmvyrciqrm.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "trusted-types nextjs#bundler goog#html default",
  // Turbopack HMR and React dev tools set src/innerHTML without Trusted Types wrappers; enforce only in production
  ...(!isDev ? ["require-trusted-types-for 'script'"] : []),
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ukmyjostwftmvyrciqrm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
