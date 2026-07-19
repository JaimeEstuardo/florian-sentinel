import React from 'react';
import { Radio, ShoppingCart, Database, Zap, Activity, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import SyncButton from './sentinel/discovery/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let dCount = 0, pCount = 0;
  try {
    dCount = await prisma.discoveryInbox.count();
    pCount = await prisma.catalogItem.count();
  } catch { /* Error fail-safe */ }

  const stats = [
    { label: "Bandeja Radar", value: dCount, icon: Radio, color: "text-[#008ed6]" },
    { label: "Mi Colección", value: pCount, icon: Database, color: "text-emerald-600" },
    { label: "Alertas Activas", value: "03", icon: Activity, color: "text-orange-500" },
    { label: "Status IA", value: "Ready", icon: Zap, color: "text-[#008ed6]" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Estación de Comando</h2>
        <SyncButton />
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 shadow-sm flex items-center justify-between group hover:border-[#008ed6] transition-all">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <s.icon size={24} className="text-slate-200 group-hover:text-[#008ed6] transition-colors" />
          </div>
        ))}
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Radar de Adquisición</h3>
          <p className="text-[11px] font-mono text-slate-400 uppercase leading-loose italic">
            Sentinel está patrullando fuentes externas. Los hallazgos aparecerán en la Bandeja Radar para tu clasificación asistida por IA.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between">
            <span className="text-[9px] font-mono text-slate-300 uppercase">Last_Scan: Just Now</span>
            <span className="text-[9px] font-mono text-[#008ed6] uppercase font-bold tracking-tighter">Signal: Stable</span>
          </div>
        </div>
        
        <div className="bg-[#0F172A] p-8 text-white flex flex-col justify-between shadow-xl">
           <div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#008ed6] mb-4">Módulo de IA Gemini</h3>
             <p className="text-sm font-light leading-relaxed text-slate-400">
               El procesamiento de lenguaje natural está configurado para detectar ediciones limitadas, preventas y variantes exclusivas.
             </p>
           </div>
           <div className="mt-6 text-[9px] font-mono text-slate-600 uppercase tracking-widest border-t border-slate-800 pt-4">
             AI_MODEL: GEMINI_1.5_FLASH // SECURE_HANDSHAKE: OK
           </div>
        </div>
      </div>
    </div>
  );
}