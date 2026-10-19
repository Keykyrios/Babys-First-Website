/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // inline the (small) stylesheet so first paint isn't blocked on a CSS request
  experimental: { inlineCss: true },
};
export default nextConfig;
