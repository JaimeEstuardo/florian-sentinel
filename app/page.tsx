import React from 'react';
import { Radio, ShoppingCart, AlertTriangle, Calendar, Activity, Database, Search } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let discoveryCount = "00";
  let preorderCount = "00";

  try {
    const d = await prisma.discoveryInbox.count();
    const p = await prisma.productEdition.count({ where: { is_preorder: true } });
    discoveryCount = d.toString().padStart(2, '0');
    preorderCount = p.toString().padStart(2, '0');
  } catch (e) {
    console.error("DB_FETCH_ERROR");
  }

  const stats = [
    { label: "Hallazgos Hoy", value: discoveryCount, icon: Radio, color: "text-[#008ed6]" },
    { label: "Preventas Abiertas", value: preorderCount, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Alertas Stock", value: "00", icon: AlertTriangle, color: "text-red-500" },
    { label: "Lanzamientos 90d", value: "00", icon: Calendar, color: "text-zinc-500" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full py-4">
      {/* SECCIÓN DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 flex items-center justify-between group hover:border-[#008ed6] transition-all">
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-[0.2em] mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon size={28} className="text-zinc-800 group-hover:text-[#008ed6]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* PANEL DE RADAR */}
        <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/10 flex flex-col h-[400px]">
          <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/40">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#008ed6] rounded-full animate-pulse" />
              RADAR_DE_ADQUISICIÓN // SEÑAL_NEON
            </h2>
            <Search size={14} className="text-zinc-600" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <Database size={48} className="text-zinc-900 mb-6" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] max-w-xs">
              Sincronizado con Neon DB. Sin registros de adquisiciones recientes.
            </p>
          </div>
          <div className="p-4 border-t border-zinc-800 bg-black/40">
            <button className="w-full py-3 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-500 hover:bg-[#008ed6] hover:text-white hover:border-[#008ed6] transition-all uppercase tracking-[0.3em]">
              Sincronizar Fuentes Externas →
            </button>
          </div>
        </div>

        {/* PANEL DE ESTATUS */}
        <div className="border border-zinc-800 bg-black p-8 flex flex-col gap-8 h-[400px]">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-500 border-b border-zinc-800 pb-3">STATUS_REPORT</h2>
          
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">DATABASE</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-tighter">ONLINE_SECURE</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">GEMINI_AI</span>
              <span className="text-[10px] font-mono text-amber-500 font-bold tracking-tighter">STANDBY_READY</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">UPTIME</span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold tracking-tighter">99.9%_OPTIMAL</span>
            </div>
          </div>

          <div className="p-5 bg-[#008ed6]/5 border border-[#008ed6]/20">
            <p className="text-[9px] text-[#008ed6] font-mono leading-relaxed uppercase tracking-widest">
              Unidad Operativa Sentinel-06. Esperando entrada de datos para clasificación inteligente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}