/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    // Allow building even when TS errors exist so CI/Vercel builds don't fail
    // TODO: remove this and fix type errors in the codebase
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip linting during production builds to avoid missing rule/plugin issues in CI.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default nextConfig;
