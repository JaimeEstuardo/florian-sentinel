// app/sentinel/discovery/DiscoveryClient.tsx
"use client";

import React, { useState } from 'react';
import { BrainCircuit, XCircle, CheckCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

export default function DiscoveryClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [syncing, setSyncing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sentinel/sync');
      if (res.ok) {
        // Recargar la página para ver los nuevos datos
        window.location.reload();
      }
    } catch (error) {
      console.error("SYNC_ERROR");
    } finally {
      setSyncing(false);
    }
  };

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
        setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      }
    } catch (error) {
      console.error("AI_ACTION_ERROR");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-2 bg-sentinel/10 border border-sentinel text-sentinel font-mono text-[10px] uppercase tracking-widest hover:bg-sentinel hover:text-white transition-all disabled:opacity-50"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {syncing ? "Sincronizando..." : "Ejecutar Escaneo de Fuentes"}
        </button>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-zinc-900">
            <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.4em]">Bandeja vacía. Inicie un escaneo.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-zinc-900/10 border border-zinc-800 p-5 flex flex-col md:flex-row justify-between items-center group hover:border-sentinel/50 transition-all gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-4">
                  <span className={`text-[9px] font-mono px-2 py-0.5 border ${item.status === 'classified' ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-zinc-600'} uppercase`}>
                    {item.status}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Source: {item.source_name}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase">{item.raw_title}</h3>
                <div className="flex gap-4 items-center mt-2">
                  <span className="text-[10px] font-mono text-sentinel uppercase font-bold tracking-[0.2em]">
                    {item.category_hint || 'No clasificado'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleClassify(item.id)}
                  className="p-2 border border-zinc-800 text-zinc-600 hover:text-amber-500 hover:border-amber-500 transition-all"
                >
                  <BrainCircuit size={18} />
                </button>
                <button className="p-2 border border-zinc-800 text-zinc-600 hover:text-emerald-500 hover:border-emerald-500 transition-all">
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}