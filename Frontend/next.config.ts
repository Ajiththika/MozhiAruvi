import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
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
