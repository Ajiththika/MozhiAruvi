import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
