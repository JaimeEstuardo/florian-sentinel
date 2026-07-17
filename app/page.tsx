import React from 'react';
import { 
  Radio, 
  ShoppingCart, 
  AlertTriangle, 
  Calendar, 
  Activity, 
  ChevronRight,
  Database,
  Search
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const discoveries = await prisma.discoveryInbox.count();
    const preorders = await prisma.productEdition.count({ where: { is_preorder: true } });
    return {
      discoveries: discoveries.toString().padStart(2, '0'),
      preorders: preorders.toString().padStart(2, '0'),
    };
  } catch (e) {
    return { discoveries: "00", preorders: "00" };
  }
}

export default async function Dashboard() {
  const data = await getStats();

  const stats = [
    { label: "Hallazgos Hoy", value: data.discoveries, icon: Radio, color: "text-[#008ed6]" },
    { label: "Preventas Abiertas", value: data.preorders, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Alertas Stock", value: "00", icon: AlertTriangle, color: "text-red-500" },
    { label: "Lanzamientos 90d", value: "00", icon: Calendar, color: "text-zinc-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      
      {/* TELEMETRÍA SUPERIOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-none flex items-center justify-between group hover:border-sentinel/50 transition-all cursor-default">
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-[0.2em] mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold font-mono tracking-tighter ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon size={24} className="text-zinc-800 group-hover:text-sentinel transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RADAR DE ADQUISICIÓN */}
        <div className="lg:col-span-2 border border-zinc-800 bg-black/20 rounded-none shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/20">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-sentinel rounded-full animate-pulse" />
              Radar // Tiempo Real
            </h2>
            <Search size={14} className="text-zinc-700" />
          </div>
          
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
             <Database size={32} className="text-zinc-900 mb-4" />
             <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] max-w-xs">
               Esperando flujo de datos. Sincroniza fuentes externas para iniciar el rastreo.
             </p>
          </div>
          
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/10">
             <button className="w-full py-2 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-400 hover:bg-sentinel hover:text-white hover:border-sentinel transition-all uppercase tracking-[0.2em]">
               Sincronizar Fuentes →
             </button>
          </div>
        </div>

        {/* ESTADO DEL NÚCLEO */}
        <div className="border border-zinc-800 bg-black/40 p-6 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-5">
              <Activity size={100} />
           </div>
           
           <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500 border-b border-zinc-800 pb-2">Estatus del Sistema</h2>
           
           <div className="space-y-4">
              <div className="flex justify-between items-end font-mono">
                 <span className="text-[10px] text-zinc-600 uppercase">Database</span>
                 <span className="text-xs text-emerald-500 tracking-tighter font-bold">ONLINE_SECURE</span>
              </div>
              <div className="flex justify-between items-end font-mono">
                 <span className="text-[10px] text-zinc-600 uppercase">IA_Classification</span>
                 <span className="text-xs text-amber-500 tracking-tighter">STANDBY</span>
              </div>
              <div className="flex justify-between items-end font-mono">
                 <span className="text-[10px] text-zinc-600 uppercase">Uptime</span>
                 <span className="text-xs text-zinc-400 tracking-tighter">99.9%</span>
              </div>
           </div>

           <div className="p-4 bg-sentinel/5 border border-sentinel/20">
              <p className="text-[9px] text-sentinel/80 font-mono leading-relaxed uppercase tracking-wider">
                Sistema Operativo Central Sentinel v1.0. Listo para adquisición de activos.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
