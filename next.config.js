/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'k.kakaocdn.net'],
  },
  webpack: (config, { isServer }) => {
    // Exclude parent node_modules from watcher to avoid permission errors
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules',
        '/Users/stroy/node_modules/**',
        '/Users/stroy/.npm/**',
      ],
    }
    return config
  },
}

module.exports = nextConfig
