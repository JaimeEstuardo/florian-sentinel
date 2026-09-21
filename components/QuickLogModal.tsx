"use client";
import React, { useState } from 'react';
import { MediaItem } from '@/lib/types';
import { PlusCircle, Calendar, Star, Check } from 'lucide-react';

interface QuickLogModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onConfirmLog: (itemId: string, note: string, rating: number, date: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  item,
  onClose,
  onConfirmLog,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<number>(item?.ratings.personal || 9.0);
  const [note, setNote] = useState('');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmLog(item.id, note.trim(), rating, date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg border-[2.5px] border-[#111111] bg-[#F5F4EE] shadow-[6px_6px_0px_0px_#111111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#111111] bg-[#111111] text-white px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-[#FF4D00]" />
            <span>NUEVO LOG DE VISIONADO // TELEMETRÍA</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-mono text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 font-mono text-xs space-y-4">
          <div className="border border-[#111111] p-3 bg-white flex gap-3 items-center">
            <img
              src={item.posterUrl}
              alt={item.title}
              className="w-12 h-16 object-cover border border-[#111111] shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold text-[#FF4D00] uppercase block">
                INCREMENTO DE REPRODUCCIÓN: #{item.watchCount} → #{item.watchCount + 1}
              </span>
              <h3 className="font-display font-black text-base uppercase italic text-[#111111] leading-tight">
                {item.title}
              </h3>
              <div className="text-[10px] text-neutral-500 uppercase mt-0.5">
                {item.director} • {item.format.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                FECHA DE VISIONADO
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white font-mono text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-[#FF4D00] mb-1">
                CALIFICACIÓN DE LA SESIÓN
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-1.5 border-2 border-[#FF4D00] bg-white font-mono text-xs font-black text-[#FF4D00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
              COMENTARIO DE LA SESIÓN // BITÁCORA
            </label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe tu comentario sobre esta sesión (ej. Revisión del transfer 4K con Dolby Atmos, detalles que notaste hoy, sensaciones)..."
              className="w-full p-2.5 border-2 border-[#111111] bg-white font-mono text-xs text-[#111111] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#111111]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-[#111111] font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-mono text-xs font-black uppercase border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
            >
              REGISTRAR LOG (+1)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
