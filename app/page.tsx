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
    { label: "Hallazgos Hoy", value: discoveryCount, icon: Radio, color: "text-sentinel" },
    { label: "Preventas Abiertas", value: preorderCount, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Alertas Stock", value: "00", icon: AlertTriangle, color: "text-red-500" },
    { label: "Lanzamientos 90d", value: "00", icon: Calendar, color: "text-zinc-500" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* CUADROS DE TELEMETRÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-neutral-900/40 border border-neutral-800 p-6 flex items-center justify-between group hover:border-sentinel transition-all">
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-[0.2em] mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon size={24} className="text-zinc-800 group-hover:text-sentinel" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RADAR CENTRAL */}
        <div className="lg:col-span-2 border border-neutral-800 bg-neutral-950/20">
          <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900/40">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-sentinel rounded-full animate-pulse" />
              Radar // Señal_Neon_Activa
            </h2>
            <Search size={14} className="text-zinc-600" />
          </div>
          <div className="py-24 flex flex-col items-center justify-center text-center p-10">
            <Database size={48} className="text-zinc-900 mb-6" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
              Sincronizado con Neon DB. Recibiendo paquetes de datos.
            </p>
          </div>
          <div className="p-4 border-t border-neutral-800">
            <button className="w-full py-3 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-zinc-500 hover:bg-sentinel hover:text-white transition-all uppercase tracking-[0.3em]">
              Sincronizar Fuentes Externas →
            </button>
          </div>
        </div>

        {/* REPORTE DE ESTATUS */}
        <div className="border border-neutral-800 bg-black p-8 flex flex-col gap-8">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-500 border-b border-neutral-800 pb-3">STATUS_REPORT</h2>
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <span className="text-[10px] font-mono text-zinc-600">DATABASE</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">ONLINE_SECURE</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <span className="text-[10px] font-mono text-zinc-600">GEMINI_AI</span>
              <span className="text-[10px] font-mono text-amber-500 font-bold">STANDBY_READY</span>
            </div>
          </div>
          <div className="p-5 bg-blue-500/5 border border-blue-500/20">
            <p className="text-[9px] text-sentinel font-mono leading-relaxed uppercase tracking-widest">
              Unidad Sentinel-06 activa. Sistema de rastreo listo para ejecución.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}