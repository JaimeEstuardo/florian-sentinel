import React from 'react';
import prisma from '@/lib/prisma';
import DiscoveryClient from './DiscoveryClient';

export const dynamic = 'force-dynamic';

async function getDiscoveries() {
  try {
    const data = await prisma.discoveryInbox.findMany({ orderBy: { created_at: 'desc' }, take: 20 });
    return JSON.parse(JSON.stringify(data));
  } catch {
    return [];
  }
}

export default async function DiscoveryPage() {
  const discoveries = await getDiscoveries();
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-sentinel font-mono uppercase">INBOX_DE_DESCUBRIMIENTOS</h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase mt-2 tracking-[0.3em]">Protocolo de validación v1.5</p>
        </div>
      </div>
      <DiscoveryClient initialItems={discoveries} />
    </div>
  );
}