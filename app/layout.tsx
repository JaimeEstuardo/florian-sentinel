import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SENTINEL 06 // Media & Cinema Archive - Jaime Florian',
  description: 'Base de datos y telemetría de archivo físico y digital: películas, series y anime de Jaime Florian.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,700&family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F5F4EE] text-[#111111] antialiased selection:bg-[#FF4D00] selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
