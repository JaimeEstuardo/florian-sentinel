// app/sentinel/discovery/DiscoveryClient.tsx
"use client";

import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';

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
        const updated = await res.json();
        setItems((prev) => prev.map(item => item.id === id ? updated : item));
      }
    } catch { console.error("AI_ERROR"); }
    finally { setLoadingId(null); }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/sentinel/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        // Al aprobar, lo quitamos de la bandeja de entrada
        setItems((prev) => prev.filter(item => item.id !== id));
      }
    } catch { console.error("APPROVE_ERROR"); }
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 p-32 text-center rounded-sm shadow-sm">
        <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em]">Bandeja de radar vacía. Ejecute un barrido desde el Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-[#008ed6] transition-all shadow-sm relative overflow-hidden">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <span className={`text-[9px] font-bold px-3 py-1 border ${item.status === 'classified' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-slate-200 text-slate-400 bg-slate-50'} uppercase tracking-widest`}>
                {item.status}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">Frecuencia: {item.source_name}</span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight max-w-2xl">{item.raw_title}</h3>
            
            <div className="flex flex-wrap gap-6 items-center pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Detectado como:</span>
                <span className="text-[10px] font-bold text-[#008ed6] uppercase tracking-widest">
                  {item.category_hint}
                </span>
              </div>
              {item.raw_url && (
                <a href={item.raw_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#008ed6] flex items-center gap-1 text-[10px] font-bold uppercase transition-colors">
                  Ver Fuente <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-8 md:mt-0">
            <button 
              onClick={() => handleClassify(item.id)}
              disabled={!!loadingId}
              className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 border border-slate-100 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
              title="Analizar con Gemini AI"
            >
              {loadingId === item.id ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
            </button>
            
            <button 
              onClick={() => handleApprove(item.id)}
              className="flex-1 md:flex-none p-4 bg-slate-900 text-white hover:bg-[#008ed6] transition-all shadow-lg"
              title="Mover a Lista de Seguimiento"
            >
              <CheckCircle size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}