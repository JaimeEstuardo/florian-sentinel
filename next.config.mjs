/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Nombre corregido según los logs de Vercel
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;