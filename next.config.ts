/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/livematchhub/:path*',
        destination:
          'https://fredapi-5da7cd50ded2.herokuapp.com/livematchhub/:path*',
        basePath: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/livematchhub/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;