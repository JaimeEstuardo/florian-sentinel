// app/sentinel/wishlist/page.tsx
import React from 'react';
import prisma from '@/lib/prisma';
import { ShoppingCart, ExternalLink, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const items = await prisma.catalogItem.findMany({
    where: { status: 'wishlist' },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Lista de Seguimiento</h1>
      
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-20 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Tu lista de deseos está vacía.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 flex justify-between items-center group hover:border-orange-500 transition-all">
              <div>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{item.category}</span>
                <h3 className="text-lg font-bold uppercase text-slate-800">{item.title}</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase mt-1">Status: Buscando mejor precio</p>
              </div>
              <div className="flex gap-3">
                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><ShoppingCart size={18} /></button>
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}