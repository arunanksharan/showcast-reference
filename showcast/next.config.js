/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // images: {
  //   domains: ['i.imgur.com'],
  // },
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['kafkajs'] = false;
    }
    return config;
  },
};

module.exports = nextConfig;
