// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   // Removed deprecated experimental.serverActions flag
//   // Server Actions are now stable in Next.js 14+
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // faster builds & smaller bundles
  typescript: {
    // Ignore type errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

