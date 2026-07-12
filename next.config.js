const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^\/api\/rides/,
      handler: "NetworkFirst",
      options: {
        cacheName: "rides-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
      },
    },
    {
      urlPattern: /^\/api\/conversations/,
      handler: "NetworkOnly",
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
