"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import "./globals.css";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      const urlKey = searchParams.get('key');
      const storedKey = localStorage.getItem('sentinel_access_key');
      const keyToVerify = urlKey || storedKey;
      
      if (!keyToVerify) return;

      setVerifying(true);
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
          // Si falla, limpiamos para evitar bucles de error
          localStorage.removeItem('sentinel_access_key');
          setAuthorized(false);
        }
      } catch (error) {
        console.error("AUTH_SYSTEM_ERROR:", error);
      } finally {
        setVerifying(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  if (!mounted) return null;

  if (verifying) {
    return (
      <div className="bg-black text-sky-500 flex items-center justify-center h-screen font-mono text-[10px] uppercase tracking-[0.3em]">
        [ VERIFICANDO_CREDENCIALES... ]
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="bg-black text-zinc-600 flex items-center justify-center h-screen font-mono text-[10px] tracking-[0.3em] uppercase flex-col gap-4">
        <span>[ UNITS_REF // ACCESS_DENIED ]</span>
        <span className="text-[8px] text-zinc-800 italic">Verifica la variable ACCESS_CODE en Vercel</span>
      </div>
    );
  }

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
             <span className="text-[10px] font-mono text-zinc-500 uppercase">System_Online</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        {children}
      </main>
      <footer className="border-t border-zinc-900 p-6 bg-black/20 text-center">
        <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
          &copy; 2025 Jaime Florian // Sentinel Division
        </p>
      </footer>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Sentinel // Hub</title>
      </head>
      <body className="bg-black">
        <Suspense fallback={null}>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}