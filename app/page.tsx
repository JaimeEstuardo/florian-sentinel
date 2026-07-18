import React from 'react';
import { Radio, ShoppingCart, AlertTriangle, Calendar, Database, Search } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let dCount = "00", pCount = "00";
  try {
    const d = await prisma.discoveryInbox.count();
    const p = await prisma.productEdition.count({ where: { is_preorder: true } });
    dCount = d.toString().padStart(2, '0');
    pCount = p.toString().padStart(2, '0');
  } catch {
    // Fail silently for build
  }

  const stats = [
    { label: "Hallazgos Hoy", value: dCount, icon: Radio, color: "text-sentinel" },
    { label: "Preventas Abiertas", value: pCount, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Alertas Stock", value: "00", icon: AlertTriangle, color: "text-red-500" },
    { label: "Lanzamientos 90d", value: "00", icon: Calendar, color: "text-zinc-500" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-neutral-900/40 border border-neutral-800 p-6 flex items-center justify-between group hover:border-sentinel transition-all">
            <div><p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{s.label}</p><p className={`text-4xl font-bold font-mono ${s.color}`}>{s.value}</p></div>
            <s.icon size={24} className="text-zinc-800 group-hover:text-sentinel" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-neutral-800 bg-neutral-950/20">
          <div className="flex justify-between p-4 border-b border-neutral-800 bg-neutral-900/40">
            <h2 className="text-[10px] font-bold text-white tracking-widest uppercase">Radar // Señal_Neon</h2>
            <Search size={14} className="text-zinc-600" />
          </div>
          <div className="py-24 flex flex-col items-center">
            <Database size={48} className="text-zinc-900 mb-4" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase">Sincronizado con Neon DB.</p>
          </div>
        </div>
        <div className="border border-neutral-800 bg-black p-8 flex flex-col gap-6">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-800 pb-2">Status_Report</h2>
          <div className="flex justify-between text-[10px] font-mono"><span className="text-zinc-600 uppercase">Database</span><span className="text-emerald-500 font-bold">ONLINE</span></div>
          <div className="flex justify-between text-[10px] font-mono"><span className="text-zinc-600 uppercase">Gemini_AI</span><span className="text-amber-500 font-bold">READY</span></div>
        </div>
      </div>
    </div>
  );
}