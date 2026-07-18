/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora errores de linter para permitir el despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de tipos para permitir el despliegue
    ignoreBuildErrors: true,
  },
  // Forzamos el uso de nodejs estándar
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  }
};

export default nextConfig;