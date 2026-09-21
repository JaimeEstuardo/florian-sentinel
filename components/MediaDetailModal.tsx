"use client";
import React, { useState } from 'react';
import { MediaItem, WatchHistoryEntry } from '@/lib/types';
import { Play, Plus, Edit2, Calendar, Disc, Volume2, Monitor, Star, Award, MapPin, X } from 'lucide-react';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onEdit: (item: MediaItem) => void;
  onSelectForPlayback: (item: MediaItem) => void;
  onAddHistoryNote: (itemId: string, note: string, rating?: number) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onEdit,
  onSelectForPlayback,
  onAddHistoryNote,
}) => {
  const [newNote, setNewNote] = useState('');
  const [sessionRating, setSessionRating] = useState<number>(10);
  const [showAddLog, setShowAddLog] = useState(false);

  if (!item) return null;

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddHistoryNote(item.id, newNote.trim(), Number(sessionRating));
    setNewNote('');
    setShowAddLog(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl border-[2.5px] border-[#111111] bg-[#F5F4EE] shadow-[6px_6px_0px_0px_#111111] my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#111111] bg-[#111111] text-white px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00]"></span>
            <span>EXPEDIENTE TÉCNICO // {item.code}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-mono text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Main Hero Card */}
          <div className="flex flex-col sm:flex-row gap-5 border-2 border-[#111111] bg-white p-4">
            {/* Poster with format badge */}
            <div className="relative w-36 sm:w-44 h-52 sm:h-64 shrink-0 border-2 border-[#111111] bg-neutral-900 shadow-[3px_3px_0px_0px_#111111]">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-[#111111] text-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {item.packaging} • {item.format.toUpperCase()}
              </div>
            </div>

            {/* Info and Ratings */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-[#FF4D00] uppercase tracking-widest">
                    FLORIAN ARCHIVE • {item.type.toUpperCase()}
                  </span>
                  <div className="bg-[#111111] text-white font-mono text-[10px] font-black px-2 py-0.5">
                    {item.watchCount} {item.watchCount === 1 ? 'SESIÓN' : 'SESIONES'}
                  </div>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl italic uppercase text-[#111111] leading-none mb-1">
                  {item.title}
                </h2>
                {item.originalTitle && item.originalTitle !== item.title && (
                  <div className="font-mono text-xs text-neutral-500 mb-1">
                    {item.originalTitle}
                  </div>
                )}

                <div className="font-mono text-xs font-bold text-blue-700 uppercase">
                  {item.director} • <span className="text-neutral-600">{item.studio}</span> • <span className="text-neutral-900">{item.year}</span>
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-1.5 my-2.5 font-mono text-[9px] font-bold uppercase">
                  {item.genres.map(g => (
                    <span key={g} className="px-2 py-0.5 bg-[#FAF9F5] border border-[#111111] text-neutral-800">
                      {g}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-600">
                    {item.runtime}
                  </span>
                </div>

                {/* Ratings Badges Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
                  <div className="border border-[#111111] p-2 bg-[#FFFDF9] text-center">
                    <div className="font-mono text-[8px] font-bold uppercase text-neutral-500">IMDb RATING</div>
                    <div className="font-display font-black text-xl text-neutral-900">
                      {item.ratings.imdb || 'N/A'}
                    </div>
                  </div>
                  <div className="border border-[#111111] p-2 bg-[#FFFDF9] text-center">
                    <div className="font-mono text-[8px] font-bold uppercase text-neutral-500">ROTTEN TOMATOES</div>
                    <div className="font-display font-black text-xl text-neutral-900">
                      {item.ratings.rottenTomatoes ? `${item.ratings.rottenTomatoes}%` : 'N/A'}
                    </div>
                  </div>
                  <div className="border border-[#111111] p-2 bg-[#FFFDF9] text-center">
                    <div className="font-mono text-[8px] font-bold uppercase text-neutral-500">METACRITIC</div>
                    <div className="font-display font-black text-xl text-neutral-900">
                      {item.ratings.metacritic || 'N/A'}
                    </div>
                  </div>
                  <div className="border-2 border-[#FF4D00] p-2 bg-[#FF4D00] text-white text-center shadow-[2px_2px_0px_0px_#111111]">
                    <div className="font-mono text-[8px] font-black uppercase text-white/90">★ NOTA JAIME</div>
                    <div className="font-display font-black text-xl text-white">
                      {item.ratings.personal.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#111111]/20 font-mono text-[11px] font-bold uppercase">
                <button
                  onClick={() => {
                    onSelectForPlayback(item);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 bg-[#FF4D00] hover:bg-[#e04400] text-white px-3.5 py-1.5 border border-[#111111] cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>CARGAR EN BANDEJA</span>
                </button>

                <button
                  onClick={() => setShowAddLog(prev => !prev)}
                  className="flex items-center gap-1.5 bg-[#111111] hover:bg-[#222222] text-white px-3.5 py-1.5 border border-[#111111] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>REGISTRAR SESIÓN HOY</span>
                </button>

                <button
                  onClick={() => {
                    onEdit(item);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-[#111111] px-3.5 py-1.5 border border-[#111111] cursor-pointer ml-auto"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>EDITAR</span>
                </button>
              </div>
            </div>
          </div>

          {/* New Session Log Input (if expanded) */}
          {showAddLog && (
            <form onSubmit={handleAddLogSubmit} className="border-2 border-[#FF4D00] bg-white p-3.5 font-mono">
              <span className="block text-[10px] font-black uppercase text-[#FF4D00] mb-1.5">
                REGISTRAR NUEVA SESIÓN EN BITÁCORA (FECHA: {new Date().toISOString().split('T')[0]})
              </span>
              <textarea
                required
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Comentarios sobre la sesión de hoy (ej. calidad del transfer, volumen, compañía, notas de la trama)..."
                className="w-full p-2 border border-[#111111] text-xs font-mono mb-2 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-600">CALIFICACIÓN SESIÓN:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={sessionRating}
                    onChange={(e) => setSessionRating(Number(e.target.value))}
                    className="w-16 px-2 py-0.5 border border-[#111111] text-xs font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="px-3 py-1 bg-white border border-[#111111] text-xs font-bold uppercase cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-[#FF4D00] text-white border border-[#111111] text-xs font-black uppercase cursor-pointer"
                  >
                    GUARDAR EN BITÁCORA
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Technical Specs Hardware Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="border border-[#111111] p-3 bg-white space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500 border-b border-neutral-200 pb-1">
                <Volume2 className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>ESPECIFICACIONES DE AUDIO</span>
              </div>
              <div className="font-bold text-[#111111]">
                {item.audioSpecs || 'Dolby Atmos 7.1 / TrueHD sin pérdida'}
              </div>
            </div>

            <div className="border border-[#111111] p-3 bg-white space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500 border-b border-neutral-200 pb-1">
                <Monitor className="w-3.5 h-3.5 text-blue-700" />
                <span>ESPECIFICACIONES DE VIDEO</span>
              </div>
              <div className="font-bold text-[#111111]">
                {item.videoSpecs || '4K Native Dolby Vision / HDR10+'}
              </div>
            </div>

            <div className="border border-[#111111] p-3 bg-white space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500 border-b border-neutral-200 pb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>UBICACIÓN EN REPISA / ARCHIVO</span>
              </div>
              <div className="font-bold text-[#111111]">
                {item.location || 'Repisa Principal // Colección Central'}
              </div>
            </div>

            <div className="border border-[#111111] p-3 bg-white space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500 border-b border-neutral-200 pb-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>EDICIÓN COLECCIONISTA</span>
              </div>
              <div className="font-bold text-[#111111]">
                {item.edition || `${item.packaging} Physical Release`}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="border border-[#111111] p-4 bg-white">
            <span className="font-mono text-[10px] font-black uppercase text-neutral-500 block mb-1">
              SINOPSIS CINEMATOGRÁFICA:
            </span>
            <p className="font-mono text-xs text-neutral-700 leading-relaxed">
              {item.synopsis}
            </p>
          </div>

          {/* User Review / Personal Log */}
          {item.userReview && (
            <div className="border-2 border-[#111111] p-4 bg-[#FFFDF9] border-l-4 border-l-[#FF4D00]">
              <span className="font-mono text-[10px] font-black uppercase text-[#FF4D00] block mb-1">
                NOTAS PERMANENTES DE JAIME FLORIAN // BITÁCORA:
              </span>
              <p className="font-mono text-xs text-neutral-900 leading-relaxed italic">
                "{item.userReview}"
              </p>
            </div>
          )}

          {/* History Timeline */}
          <div className="border border-[#111111] p-4 bg-white">
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-3">
              <span className="font-mono text-[10px] font-black uppercase text-neutral-600">
                HISTORIAL DE REPRODUCCIONES / VISIONADOS ({item.history?.length || 0})
              </span>
              <span className="font-mono text-[9px] text-neutral-400">
                AUDITORÍA DE ROTACIÓN
              </span>
            </div>

            {item.history && item.history.length > 0 ? (
              <div className="space-y-2.5 font-mono">
                {item.history.map((h, idx) => (
                  <div key={h.id || idx} className="p-2.5 border border-neutral-200 bg-[#FAF9F5] text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 mb-1">
                      <span className="text-[#FF4D00]">{h.date}</span>
                      {h.rating && <span className="bg-[#111111] text-white px-1.5 py-0.2">★ {h.rating}</span>}
                    </div>
                    <div className="text-neutral-800 leading-normal">
                      {h.note}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 font-mono text-xs text-neutral-400 uppercase">
                Aún no hay notas de historial registradas para este título. Usa el botón "REGISTRAR SESIÓN HOY".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
