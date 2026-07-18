"use client";

import React, { useState } from 'react';
import { BrainCircuit, XCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function DiscoveryClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClassify = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/sentinel/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        const updatedItem = await res.json();
        setItems((prev) => prev.map(item => item.id === id ? updatedItem : item));
      }
    } catch (error) {
      console.error("AI_ACTION_ERROR:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="py-32 text-center border border-dashed border-zinc-900 bg-zinc-900/5">
        <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.4em]">
          Bandeja de entrada vacía. Esperando señal del radar...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-zinc-900/10 border border-zinc-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-[#008ed6]/50 transition-all gap-6 text-white">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-4">
              <span className={`text-[9px] font-mono px-2 py-0.5 border ${item.status === 'classified' ? 'border-[#008ed6]/50 text-[#008ed6] bg-[#008ed6]/5' : 'border-zinc-800 text-zinc-600'} uppercase tracking-widest`}>
                {item.status}
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase italic">Ref: {item.source_name || 'Desconocido'}</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{item.raw_title}</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Categoría:</span>
                <span className="text-[10px] font-mono text-[#008ed6] uppercase font-bold tracking-widest">
                  {item.category_hint || 'Pendiente de IA'}
                </span>
              </div>
              {item.raw_url && (
                <a href={item.raw_url} target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:text-white transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
            <button 
              onClick={() => handleClassify(item.id)}
              disabled={loadingId === item.id}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50"
            >
              {loadingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
            </button>
            <button className="flex-1 md:flex-none p-2 border border-zinc-800 text-zinc-700 hover:text-red-500 hover:border-red-500 transition-all">
              <XCircle size={18} />
            </button>
            <button className="flex-1 md:flex-none p-2 border border-zinc-800 text-zinc-700 hover:text-emerald-500 hover:border-emerald-500 transition-all">
              <CheckCircle size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}