/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
      {
        source: '/api/audit-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_AUDIT_API_URL}/:path*`,
      },
    ]
  },
}

export default nextConfig
