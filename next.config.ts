import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de producto subidas desde el panel de administración,
    // guardadas en el bucket público de Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yaxagfzxibjipavncujr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
