import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    const rawUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    
    // If we are in production and BACKEND_URL is missing, we assume a local proxy setup
    // or try to prevent a loop by not rewriting to self.
    const backendBase = rawUrl.replace(/\/api\/?$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendBase}/auth/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/student/events", destination: "/events", permanent: true },
      { source: "/tutor/events", destination: "/events", permanent: true },
      { source: "/student/blogs", destination: "/blogs", permanent: true },
      { source: "/student/tutors", destination: "/tutors", permanent: true },
    ];
  },
};

export default nextConfig;
