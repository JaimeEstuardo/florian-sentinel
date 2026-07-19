import React from 'react';
import prisma from '@/lib/prisma';
import { ShoppingCart, Trash2, PackageSearch } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  let items = [];
  try {
    const data = await prisma.catalogItem.findMany({
      where: { status: 'wishlist' },
      orderBy: { created_at: 'desc' }
    });
    items = JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error("ERROR_FETCHING_WISHLIST");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Lista de Seguimiento</h1>
        <p className="text-[10px] font-mono text-slate-400 uppercase mt-2">Activos en radar de compra inmediata</p>
      </div>
      
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-24 text-center rounded-sm">
            <PackageSearch className="mx-auto text-slate-100 mb-4" size={48} />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">No hay objetivos en la lista.</p>
          </div>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 flex justify-between items-center group hover:border-[#008ed6] transition-all shadow-sm">
              <div>
                <span className="text-[9px] font-bold text-[#008ed6] border border-[#008ed6]/20 bg-[#008ed6]/5 px-2 py-0.5 uppercase tracking-widest">{item.category}</span>
                <h3 className="text-lg font-black uppercase text-slate-800 mt-2">{item.title}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Status: Monitoring_Price</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 hover:bg-[#0F172A] hover:text-white transition-all rounded-sm"><ShoppingCart size={18} /></button>
                <button className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all rounded-sm"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}