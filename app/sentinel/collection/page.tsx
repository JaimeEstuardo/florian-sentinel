import React from 'react';
import prisma from '@/lib/prisma';
import { Database, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  let items = [];
  try {
    const data = await prisma.catalogItem.findMany({
      where: { status: 'owned' },
      orderBy: { created_at: 'desc' }
    });
    items = JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error("ERROR_FETCHING_COLLECTION");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Mi Colección</h1>
        <p className="text-[10px] font-mono text-slate-400 uppercase mt-2">Activos físicos verificados en inventario</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 p-24 text-center">
          <Database className="mx-auto text-slate-100 mb-4" size={48} />
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Tu colección física está vacía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 shadow-sm border-t-4 border-t-emerald-500 hover:shadow-md transition-all">
               <div className="flex justify-between items-start">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                 <ShieldCheck size={14} className="text-emerald-500" />
               </div>
               <h3 className="font-black text-slate-900 uppercase mt-4 leading-tight">{item.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}