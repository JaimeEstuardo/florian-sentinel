// app/sentinel/discovery/page.tsx
import React from 'react';
import prisma from '@/lib/prisma';
import DiscoveryClient from './DiscoveryClient';

export const dynamic = 'force-dynamic';

async function getDiscoveries() {
  try {
    const data = await prisma.discoveryInbox.findMany({ 
      orderBy: { created_at: 'desc' },
      take: 100 // Aumentamos a 100 para ver todo el radar
    });
    return JSON.parse(JSON.stringify(data));
  } catch { return []; }
}

export default async function DiscoveryPage() {
  const discoveries = await getDiscoveries();
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-[10px] font-mono text-[#008ed6] uppercase tracking-[0.4em] mb-2">Protocolo // Adquisición</h2>
          <h1 className="text-4xl font-black text-slate-900 font-sans uppercase italic tracking-tighter">Bandeja Radar</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Activos Detectados</span>
          <p className="text-2xl font-black text-slate-900">{discoveries.length}</p>
        </div>
      </div>
      <DiscoveryClient initialItems={discoveries} />
    </div>
  );
}