/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_OPEN_KAKAO_URL: process.env.NEXT_PUBLIC_OPEN_KAKAO_URL || "",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
