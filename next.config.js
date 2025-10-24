/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow loading images served from Cloudinary (used for business assets)
    domains: ["res.cloudinary.com"],
    // If you prefer the more flexible remotePatterns option, replace domains with:
    // remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }]
  },
};

module.exports = nextConfig;
