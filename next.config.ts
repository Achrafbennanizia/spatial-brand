import type { NextConfig } from "next";

/** Project Pages live at https://<user>.github.io/spatial-brand */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(isGithubPages
    ? {
        basePath: "/spatial-brand",
        assetPrefix: "/spatial-brand",
      }
    : {}),
};

export default nextConfig;
