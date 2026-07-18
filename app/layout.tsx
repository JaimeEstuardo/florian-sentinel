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
    
    const verifyAccess = async () => {
      const urlKey = searchParams.get('key');
      const storedKey = localStorage.getItem('sentinel_access_key');
      const keyToTest = urlKey || storedKey;
      
      if (!keyToTest) return;

      setVerifying(true);
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyToTest }),
        });

        if (res.ok) {
          localStorage.setItem('sentinel_access_key', keyToTest);
          setAuthorized(true);
        } else {
          if (urlKey) localStorage.removeItem('sentinel_access_key');
        }
      } catch (err) {
        console.error("AUTH_SYSTEM_ERROR");
      } finally {
        setVerifying(false);
      }
    };

    verifyAccess();
  }, [searchParams]);

  if (!mounted) return <div className="bg-black min-h-screen w-full" />;

  if (verifying) {
    return (
      <div className="bg-[#050505] text-[#008ed6] flex items-center justify-center h-screen font-mono text-[10px] uppercase tracking-[0.3em]">
        [ SINCRONIZANDO_LLAVE_MAESTRA... ]
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="bg-[#050505] text-zinc-600 flex flex-col items-center justify-center h-screen font-mono text-[10px] tracking-[0.3em] uppercase">
        <div className="border border-zinc-900 p-10 bg-black/40 text-center space-y-6 max-w-sm">
          <p className="text-zinc-500">[ SYSTEM_LOCKED ]</p>
          <div className="h-[1px] w-full bg-zinc-900" />
          <p className="text-zinc-800 leading-loose normal-case tracking-normal italic text-[9px]">
            Se requiere llave de acceso activa para el Protocolo Sentinel.<br/>
            Use el parámetro ?key= en la URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#ececec]">
      <header className="border-b border-zinc-800 p-4 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-1 h-4 bg-[#008ed6]" />
            <span className="text-[#008ed6] font-mono text-xs font-bold tracking-tighter uppercase">Sentinel_v1.0 // Jaime Florian</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        {children}
      </main>
      <footer className="border-t border-zinc-900 p-8 bg-black/20 text-center">
        <p className="font-mono text-[9px] text-zinc-800 uppercase tracking-[0.3em]">
          Unidad de Adquisición Sentinel // Hub Central 2025
        </p>
      </footer>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Sentinel Hub</title>
      </head>
      <body className="bg-black m-0 p-0 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="bg-black min-h-screen w-full" />}>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}