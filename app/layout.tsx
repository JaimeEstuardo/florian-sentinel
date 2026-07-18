"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import "./globals.css";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const verifyAccess = async () => {
      const urlKey = searchParams.get('key');
      const storedKey = localStorage.getItem('sentinel_access_key');
      const keyToTest = urlKey || storedKey;
      if (!keyToTest) return;

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyToTest }),
        });
        if (res.ok) {
          localStorage.setItem('sentinel_access_key', keyToTest);
          setAuthorized(true);
        }
      } catch {
        console.error("AUTH_ERROR");
      }
    };
    verifyAccess();
  }, [searchParams]);

  if (!mounted) return <div className="bg-black min-h-screen w-full" />;

  if (!authorized) {
    return (
      <div className="bg-[#050505] text-zinc-600 flex flex-col items-center justify-center h-screen font-mono text-[10px] tracking-[0.3em] uppercase text-center">
        <div className="border border-zinc-900 p-10 bg-black/40 space-y-6 max-w-sm">
          <p>[ SYSTEM_LOCKED ]</p>
          <p className="text-zinc-800 italic text-[9px] normal-case tracking-normal">Inicie sesión mediante el Protocolo Central</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#ececec]">
      <header className="border-b border-zinc-800 p-4 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[#008ed6] font-mono text-xs font-bold uppercase">
          <span>SENTINEL_v1.0 // Division 06</span>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-zinc-500 text-[10px]">ACTIVE</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head><title>Sentinel Hub</title></head>
      <body className="bg-black m-0 p-0 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="bg-black min-h-screen w-full" />}>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}