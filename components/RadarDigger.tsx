"use client";
import React, { useState } from 'react';
import { MediaItem } from '@/lib/types';
import { Disc, Play, Shuffle, Calendar, Sparkles, ExternalLink, BookmarkCheck } from 'lucide-react';

interface RadarDiggerProps {
  items: MediaItem[];
  onSelectForPlayback: (item: MediaItem) => void;
  onOpenDetail: (item: MediaItem) => void;
}

type RadarFilter = 'ALL' | 'FORGOTTEN' | '4K' | 'ANIME' | 'SCIFI' | 'FAVORITES';

export const RadarDigger: React.FC<RadarDiggerProps> = ({
  items,
  onSelectForPlayback,
  onOpenDetail,
}) => {
  const [activeFilter, setActiveFilter] = useState<RadarFilter>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Filter pool based on activeFilter
  const pool = items.filter(item => {
    if (activeFilter === 'FORGOTTEN') return item.watchCount === 0 || !item.lastWatched;
    if (activeFilter === '4K') return item.format === '4k_uhd' || item.format === 'steelbook';
    if (activeFilter === 'ANIME') return item.type === 'anime';
    if (activeFilter === 'SCIFI') return item.genres.some(g => /sci-fi|cyberpunk|espacial/i.test(g));
    if (activeFilter === 'FAVORITES') return item.isFavorite;
    return true;
  });

  const activeItem = pool.length > 0 ? pool[currentIndex % pool.length] : items[0];

  const handleNext = () => {
    if (pool.length > 0) {
      setCurrentIndex(prev => (prev + 1) % pool.length);
    }
  };

  return (
    <div className="w-full my-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left 2 Cols: Crate Digger / Radar Sugerencia Aleatoria */}
        <div className="lg:col-span-2 border-[2.5px] border-[#111111] bg-white p-4 sm:p-5">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#111111]/20 pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-wider text-[#111111]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00]"></span>
              <span>RADAR DIGGER // SUGERENCIA ALEATORIA</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              {pool.length} TÍTULOS EN RADAR
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5 font-mono text-[10px] font-bold uppercase">
            {[
              { id: 'ALL', label: 'CUALQUIERA' },
              { id: 'FORGOTTEN', label: 'JOYAS OLVIDADAS (+60D)' },
              { id: '4K', label: 'SOLO 4K FÍSICO' },
              { id: 'ANIME', label: 'SOLO ANIME' },
              { id: 'SCIFI', label: 'SCI-FI & CULTO' },
              { id: 'FAVORITES', label: 'FAVORITOS' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id as RadarFilter);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 border border-[#111111] transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#111111] text-white'
                    : 'bg-white text-[#111111] hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Item Highlight Showcase */}
          {activeItem ? (
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Cover with badge */}
              <div 
                onClick={() => onOpenDetail(activeItem)}
                className="relative w-28 sm:w-32 h-40 sm:h-44 shrink-0 border-2 border-[#111111] bg-neutral-900 cursor-pointer overflow-hidden group shadow-[2px_2px_0px_0px_#111111]"
              >
                <img
                  src={activeItem.posterUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 bg-[#111111] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase">
                  {activeItem.packaging === 'STEELBOOK' ? 'STEELBOOK' : (activeItem.format === '4k_uhd' ? '4K UHD' : activeItem.format.toUpperCase())}
                </div>
              </div>

              {/* Info & Action Buttons */}
              <div className="flex-1 flex flex-col justify-between h-full space-y-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FF4D00] uppercase tracking-widest block">
                    SUGERENCIA ACTIVA
                  </span>
                  <h3 
                    onClick={() => onOpenDetail(activeItem)}
                    className="text-xl sm:text-2xl font-black italic tracking-tight text-[#111111] uppercase hover:text-[#FF4D00] cursor-pointer font-display leading-tight"
                  >
                    {activeItem.title}
                  </h3>
                  <div className="font-mono text-[11px] font-bold text-blue-700 uppercase mt-0.5">
                    {activeItem.director} • <span className="text-neutral-600">{activeItem.year}</span>
                  </div>

                  <p className="font-mono text-[11px] text-neutral-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {activeItem.synopsis}
                  </p>

                  <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-500 mt-2">
                    <span>
                      {activeItem.watchCount > 0 
                        ? `${activeItem.watchCount} visualizaciones registradas` 
                        : '● Sin reproducir aún'}
                    </span>
                    {activeItem.lastWatched && (
                      <span>• Última: {activeItem.lastWatched}</span>
                    )}
                  </div>
                </div>

                {/* Big Action Buttons (Matching Audioslave's PONER EN LA BANDEJA) */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectForPlayback(activeItem)}
                    className="flex items-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>PONER EN LA BANDEJA</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-[#111111] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-[#111111] cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>SIGUIENTE TÍTULO</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center font-mono text-xs text-neutral-500 uppercase">
              No hay títulos en este criterio de radar.
            </div>
          )}
        </div>

        {/* Right 1 Col: Hoy en la historia del Cine & Anime (Matching Audioslave) */}
        <div className="border-[2.5px] border-[#111111] bg-white p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2.5 mb-3 text-[10px] font-mono font-bold uppercase text-neutral-600">
              <span className="flex items-center gap-1.5 text-[#111111]">
                <Calendar className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>HOY EN LA HISTORIA DEL CINE</span>
              </span>
              <span className="bg-[#111111] text-white px-1.5 py-0.2">
                {new Date().toLocaleDateString('es-ES', { month: '2-digit', day: '2-digit' })}
              </span>
            </div>

            <div className="border border-[#FF4D00]/40 bg-[#FFFDF9] p-3 border-l-4 border-l-[#FF4D00]">
              <div className="font-mono text-[10px] font-bold text-[#FF4D00] uppercase mb-1">
                EFEMÉRIDE // FLORIAN ARCHIVE
              </div>
              <h4 className="font-display font-black text-sm uppercase italic text-[#111111] leading-tight mb-1.5">
                BLADE RUNNER & CYBERPUNK CHRONICLES
              </h4>
              <p className="font-mono text-[10px] text-neutral-700 leading-relaxed">
                "Todos esos momentos se perderán en el tiempo, como lágrimas en la lluvia. Hora de registrar."
                La colección cuenta con 4 transferencias nativas de culto en 4K UHD restauradas a nivel de referencia.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#111111]/10 mt-3 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
            <span className="text-emerald-700 font-bold">✓ EN TU COLECCIÓN (4K DISPONIBLE)</span>
            <span className="text-neutral-400">FLORIAN ARCHIVE V3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
