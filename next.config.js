/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ces modules sont utilisés par Genkit/Firebase et ne sont pas destinés à être groupés par Webpack pour le serveur.
      // Les exclure résout les avertissements "Critical dependency".
      config.externals.push(
        "handlebars",
        "require-in-the-middle"
      );
    }
    return config;
  },
};

module.exports = nextConfig;
