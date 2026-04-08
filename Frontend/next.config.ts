import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  async rewrites() {
    const backendBase = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: "/student/events", destination: "/events", permanent: true },
      { source: "/tutor/events",   destination: "/events", permanent: true },
      { source: "/student/blogs",  destination: "/blogs",  permanent: true },
      { source: "/student/tutors", destination: "/tutors",  permanent: true },
    ];
  },
};

export default nextConfig;
