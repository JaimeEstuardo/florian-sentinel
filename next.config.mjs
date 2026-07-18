/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración de paquetes externos para Next.js 15
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;