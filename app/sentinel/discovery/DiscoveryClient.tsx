"use client";

import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, Loader2 } from 'lucide-react';

interface DiscoveryItem {
  id: string;
  status: string;
  source_name: string | null;
  raw_title: string;
  category_hint: string | null;
  raw_url: string | null;
}

export default function DiscoveryClient({ initialItems }: { initialItems: DiscoveryItem[] }) {
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
    } catch (_error) {
      console.error("AI_ACTION_ERROR");
    } finally {
      setLoadingId(null);
    }
  };

  if (!items || items.length === 0) {
    return <div className="py-32 text-center border border-dashed border-zinc-900"><p className="font-mono text-[10px] text-zinc-700 uppercase">Bandeja Vacía.</p></div>;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-zinc-900/10 border border-zinc-800 p-5 flex justify-between items-center group hover:border-sentinel transition-all">
          <div className="space-y-2">
            <span className="text-[9px] font-mono px-2 py-0.5 border border-zinc-800 text-zinc-500 uppercase">{item.status}</span>
            <h3 className="text-sm font-bold text-zinc-100 uppercase">{item.raw_title}</h3>
            <p className="text-[10px] font-mono text-sentinel uppercase font-bold">{item.category_hint || 'Pendiente IA'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleClassify(item.id)} disabled={!!loadingId} className="p-2 border border-zinc-800 text-zinc-500 hover:text-amber-500">
              {loadingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
            </button>
            <button className="p-2 border border-zinc-800 text-zinc-500 hover:text-emerald-500"><CheckCircle size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}