"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import "./globals.css";

/**
 * COMPONENTE DE SEGURIDAD (Inner)
 * Maneja la lógica de autenticación dentro del Suspense
 */
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      const storedKey = localStorage.getItem('sentinel_access_key');
      const urlKey = searchParams.get('key');
      const keyToVerify = urlKey || storedKey;
      
      if (!keyToVerify) return;

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyToVerify }),
        });

        if (res.ok) {
          localStorage.setItem('sentinel_access_key', keyToVerify);
          setAuthorized(true);
        } else {
          // Si la llave no es válida, limpiamos el storage
          localStorage.removeItem('sentinel_access_key');
        }
      } catch (error) {
        console.error("SENTINEL_AUTH_ERROR:", error);
      }
    };

    checkAuth();
  }, [searchParams]);

  // Evita el error de hidratación esperando a que el cliente esté montado
  if (!mounted) {
    return (
      <div className="bg-black text-zinc-900 flex items-center justify-center h-screen font-mono text-[10px] uppercase tracking-[0.3em]">
        [ INITIALIZING_SENTINEL_UI ]
      </div>
    );
  }

  // Pantalla de bloqueo si no está autorizado
  if (!authorized) {
    return (
      <div className="bg-black text-zinc-600 flex items-center justify-center h-screen font-mono text-[10px] tracking-[0.3em] uppercase">
        [ UNITS_REF // ACCESS_DENIED ]
      </div>
    );
  }

  // Interfaz principal una vez autorizado
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-zinc-200 antialiased font-sans">
      <header className="border-b border-zinc-800 p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sky-500 font-mono text-xs tracking-tighter font-bold">FLORIAN // SENTINEL_v1.0</span>
            <div className="h-3 w-[1px] bg-zinc-800 hidden md:block"></div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:block italic">Protocol Sentinel Active</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] font-mono text-zinc-500">LINK_ESTABLISHED</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        {children}
      </main>
      <footer className="border-t border-zinc-900 p-6 bg-black/20 text-center">
        <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
          &copy; 2025 Jaime Florian // Central Operating System // Sentinel Division
        </p>
      </footer>
    </div>
  );
}

/**
 * LAYOUT RAÍZ
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Sentinel // Central Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-black overflow-x-hidden">
        {/* Next.js requiere Suspense para usar useSearchParams en Client Components */}
        <Suspense fallback={
          <div className="bg-black text-zinc-900 flex items-center justify-center h-screen font-mono text-[10px] uppercase tracking-[0.3em]">
            [ LOADING_SYSTEM_CORE ]
          </div>
        }>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}