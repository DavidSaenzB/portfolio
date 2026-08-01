import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Alias en inglés → la página canónica en /privacidad (el toggle decide idioma).
      { source: "/privacy", destination: "/privacidad", permanent: true },
    ];
  },
};

export default nextConfig;
