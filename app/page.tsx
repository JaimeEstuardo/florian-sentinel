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
  // Intentamos contar registros reales de la DB
  const discoveries = await prisma.discoveryInbox.count();
  const preorders = await prisma.productEdition.count({ where: { is_preorder: true } });
  
  return {
    discoveries: discoveries.toString().padStart(2, '0'),
    preorders: preorders.toString().padStart(2, '0'),
    alerts: "00", // Implementaremos lógica de stock más adelante
    upcoming: "00"
  };
}

export default async function Dashboard() {
  const data = await getStats();

  const stats = [
    { label: "Hallazgos Hoy", value: data.discoveries, icon: Radio, color: "text-[#008ed6]" },
    { label: "Preventas Abiertas", value: data.preorders, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Alertas Stock", value: data.alerts, icon: AlertTriangle, color: "text-red-500" },
    { label: "Lanzamientos 90d", value: data.upcoming, icon: Calendar, color: "text-zinc-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* SECCIÓN 1: TELEMETRÍA SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-sm flex items-center justify-between group hover:border-zinc-700 transition-colors">
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon size={20} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECCIÓN 2: RASTREO EN TIEMPO REAL */}
        <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/10 rounded-sm">
          <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/30">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Activity size={14} className="text-[#008ed6]" />
              Radar de Adquisición // Tiempo Real
            </h2>
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-mono text-zinc-600 uppercase">Estado: Conectado a DB</span>
               <Search size={14} className="text-zinc-600" />
            </div>
          </div>
          
          <div className="p-8 text-center border-b border-zinc-800/50">
             <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
               No se han detectado nuevos ítems en la base de datos Neon.
             </p>
          </div>
          
          <div className="p-3 border-t border-zinc-800 text-center">
             <button className="text-[10px] font-mono text-zinc-500 hover:text-sky-500 uppercase tracking-widest transition-colors">
               Sincronizar Fuentes Externas →
             </button>
          </div>
        </div>

        {/* SECCIÓN 3: ESTADO DEL SISTEMA */}
        <div className="border border-zinc-800 bg-zinc-900/10 rounded-sm flex flex-col p-6 space-y-4">
           <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Estado del Núcleo</h2>
           <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                 <span className="text-zinc-600">DATABASE:</span>
                 <span className="text-emerald-500">ONLINE</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                 <span className="text-zinc-600">GEMINI_AI:</span>
                 <span className="text-amber-500">READY</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                 <span className="text-zinc-600">LAST_SCAN:</span>
                 <span className="text-zinc-400">JUST_NOW</span>
              </div>
           </div>
           <div className="pt-4 border-t border-zinc-800">
              <p className="text-[9px] text-zinc-700 font-mono leading-relaxed">
                 SISTEMA OPERATIVO CENTRAL SENTINEL. ESPERANDO INSTRUCCIONES DE CLASIFICACIÓN.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}