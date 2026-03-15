/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@taeja/shared',
    '@taeja/config',
    '@taeja/locales',
  ],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
    serverComponentsExternalPackages: ['nodemailer'],
  },
}

module.exports = nextConfig
