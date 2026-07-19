// app/sentinel/collection/page.tsx
import React from 'react';
import prisma from '@/lib/prisma';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  const items = await prisma.catalogItem.findMany({
    where: { status: 'owned' },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Mi Colección</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-3 bg-white border border-dashed border-slate-200 p-20 text-center">
             <Package className="mx-auto text-slate-100 mb-4" size={40} />
             <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">No hay activos registrados en tu colección física.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 shadow-sm border-t-4 border-t-emerald-500">
               <span className="text-[9px] font-bold text-slate-400 uppercase">{item.category}</span>
               <h3 className="font-bold text-slate-900 uppercase mt-2">{item.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}