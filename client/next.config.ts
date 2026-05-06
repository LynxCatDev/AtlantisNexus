import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const r2ImageHost =
  process.env.NEXT_PUBLIC_R2_IMAGE_HOST ??
  "pub-4ff70c5cdf5a4d5392fb7d504467b9e5.r2.dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: r2ImageHost },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default withNextIntl(nextConfig);
