// app/sentinel/discovery/page.tsx
import React from 'react';
import prisma from '@/lib/prisma';
import DiscoveryClient from './DiscoveryClient';

export const dynamic = 'force-dynamic';

async function getDiscoveries() {
  try {
    return await prisma.discoveryInbox.findMany({
      orderBy: { created_at: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error("DB_FETCH_ERROR:", error);
    return [];
  }
}

export default async function DiscoveryPage() {
  const discoveries = await getDiscoveries();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-[#008ed6] font-mono uppercase">
            INBOX_DE_DESCUBRIMIENTOS
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase mt-2 tracking-[0.3em]">
            Análisis de activos mediante Google Gemini AI v1.5
          </p>
        </div>
        <div className="hidden md:flex bg-zinc-900/30 border border-zinc-800 px-4 py-2 items-center gap-3">
           <div className="w-2 h-2 bg-[#008ed6] rounded-full animate-pulse shadow-[0_0_10px_#008ed6]" />
           <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest text-sentinel">Radar_Activo</span>
        </div>
      </div>

      {/* Pasamos los datos al componente de cliente para que los botones funcionen */}
      <DiscoveryClient initialItems={JSON.parse(JSON.stringify(discoveries))} />
    </div>
  );
}