/** @type {import('next').NextConfig} */
const nextConfig = {
  // Articles are loaded via gray-matter + next-mdx-remote, not as pages
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
