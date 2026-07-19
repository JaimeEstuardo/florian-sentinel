// app/page.tsx
import React from 'react';
import { Radio, ListTree, Database, Zap, Activity } from 'lucide-react';
import prisma from '@/lib/prisma';
import SyncButton from './sentinel/discovery/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let discoveryCount = 0;
  let wishlistCount = 0;
  let collectionCount = 0;

  try {
    discoveryCount = await prisma.discoveryInbox.count();
    wishlistCount = await prisma.catalogItem.count({ where: { status: 'wishlist' } });
    collectionCount = await prisma.catalogItem.count({ where: { status: 'owned' } });
  } catch (e) { console.error("DB_ERROR"); }

  const stats = [
    { label: "Bandeja Radar", value: discoveryCount, icon: Radio, color: "text-[#008ed6]" },
    { label: "Lista Seguimiento", value: wishlistCount, icon: ListTree, color: "text-orange-500" },
    { label: "Mi Colección", value: collectionCount, icon: Database, color: "text-emerald-600" },
    { label: "Status IA", value: "Online", icon: Zap, color: "text-[#008ed6]" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Estación de Comando</h2>
        <SyncButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 shadow-sm flex items-center justify-between group hover:border-[#008ed6] transition-all">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <s.icon size={24} className="text-slate-100 group-hover:text-[#008ed6] transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Estado del Radar</h3>
          <p className="text-[11px] font-mono text-slate-400 uppercase leading-loose italic">
            {discoveryCount > 0 
              ? `Hay ${discoveryCount} activos pendientes de clasificar en la bandeja.` 
              : "No hay detecciones nuevas. El radar está patrullando fuentes externas."}
          </p>
        </div>
        
        <div className="bg-[#0F172A] p-8 text-white flex flex-col justify-between shadow-xl">
           <div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#008ed6] mb-4">Gemini Intelligence</h3>
             <p className="text-sm font-light leading-relaxed text-slate-300 italic">
               "Analizando patrones de preventas y ediciones limitadas en tiempo real."
             </p>
           </div>
           <div className="mt-6 text-[9px] font-mono text-slate-600 uppercase tracking-widest border-t border-slate-800 pt-4">
             AI_ACTIVE // AUTO_SCAN: ENABLED (24H)
           </div>
        </div>
      </div>
    </div>
  );
}