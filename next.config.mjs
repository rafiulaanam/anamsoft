/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // Skip linting during production builds to avoid missing rule/plugin issues in CI.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default nextConfig;
