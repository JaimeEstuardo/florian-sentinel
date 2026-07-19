// app/layout.tsx (Contenido completo corregido)
"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Radio, ListTree, Database, Home } from 'lucide-react';
import "./globals.css";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
      } catch { console.error("AUTH_ERROR"); }
    };
    verifyAccess();
  }, [searchParams]);

  if (!mounted) return <div className="bg-[#F8FAFC] min-h-screen w-full" />;

  if (!authorized) {
    return (
      <div className="bg-[#F8FAFC] flex items-center justify-center h-screen font-mono text-[10px] uppercase">
        <div className="border border-slate-200 p-10 bg-white shadow-xl"> [ SISTEMA BLOQUEADO ] </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Bandeja Radar', icon: Radio, path: '/sentinel/discovery' },
    { name: 'Lista de Seguimiento', icon: ListTree, path: '/sentinel/wishlist' },
    { name: 'Mi Colección', icon: Database, path: '/sentinel/collection' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col fixed h-full z-50">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-xl font-black italic">SENTINEL<span className="text-[#008ed6] ml-1">06</span></h1>
          <p className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-widest">Adquisition Unit</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(`${item.path}?key=${localStorage.getItem('sentinel_access_key')}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all ${pathname === item.path ? 'bg-[#008ed6] text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <item.icon size={16} /> {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <a href="https://www.jaimeflorian.com" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-500 hover:text-white uppercase">
            <Home size={16} /> Hub Central
          </a>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Terminal_Active // {pathname}</span>
        </header>
        <section className="p-8">{children}</section>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#F1F5F9] m-0 p-0 antialiased">
        <Suspense fallback={null}><AuthWrapper>{children}</AuthWrapper></Suspense>
      </body>
    </html>
  );
}