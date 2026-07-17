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
          localStorage.removeItem('sentinel_access_key');
          setAuthorized(false);
        }
      } catch (error) {
        console.error("AUTH_ERROR");
      } finally {
        setVerifying(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  if (!mounted) return null;

  if (verifying) {
    return (
      <div className="bg-[#050505] text-[#008ed6] flex items-center justify-center h-screen font-mono text-[10px] uppercase tracking-[0.3em]">
        [ SINCRONIZANDO_LLAVE_MAESTRA... ]
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="bg-[#050505] text-zinc-700 flex flex-col items-center justify-center h-screen font-mono text-[10px] tracking-[0.3em] uppercase">
        <div className="border border-zinc-900 p-8 bg-black/40 text-center space-y-4">
          <p>[ ACCESO_DENEGADO ]</p>
          <p className="text-[8px] text-zinc-800 italic normal-case tracking-normal">Inicie sesión mediante el Protocolo Central de Jaime Florian</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#ececec]">
      {/* HEADER TÉCNICO */}
      <header className="border-b border-zinc-800 p-4 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-1 h-4 bg-[#008ed6]" />
            <span className="text-[#008ed6] font-mono text-xs font-bold tracking-tighter">SENTINEL_OPERATING_SYSTEM // V1.0</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live_Signal</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 p-8 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.2em]">
            &copy; 2025 Jaime Florian // Central Hub // Sentinel Acquisition Division
          </p>
          <div className="flex gap-6 text-[9px] font-mono text-zinc-800 uppercase">
             <span>Protocol: Alpha-06</span>
             <span>Status: Secured</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-[#050505]">
      <body className="bg-[#050505]">
        <Suspense fallback={null}>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}