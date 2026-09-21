"use client";
import React from 'react';
import { FilterState, MediaFormat, PackagingType, WatchStatus, MediaType } from '@/lib/types';
import { Search, SlidersHorizontal, ArrowDownUp, Check } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  totalFiltered: number;
  totalAll: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  totalFiltered,
  totalAll,
}) => {
  return (
    <div className="w-full my-5 border-[2.5px] border-[#111111] bg-white p-4 space-y-3.5">
      {/* Top Row: Search Input + Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="BUSCAR POR TÍTULO, DIRECTOR, ESTUDIO O GÉNERO..."
            className="w-full pl-9 pr-4 py-2 border-2 border-[#111111] bg-[#FAF9F5] font-mono text-xs font-bold uppercase tracking-wider text-[#111111] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF4D00]"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center font-mono text-xs font-bold text-neutral-400 hover:text-black cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
          <span className="text-neutral-500 flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>ORDEN:</span>
          </span>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              onFilterChange({
                sortBy: by as FilterState['sortBy'],
                sortOrder: order as 'asc' | 'desc',
              });
            }}
            className="border-2 border-[#111111] bg-white px-2.5 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer focus:outline-none"
          >
            <option value="lastWatched-desc">ÚLTIMO VISIONADO (RECIENTES)</option>
            <option value="watchCount-desc">MÁS RE-WATCHES (ROTACIÓN)</option>
            <option value="personalRating-desc">CALIFICACIÓN JAIME (TOP)</option>
            <option value="imdb-desc">IMDb RATING</option>
            <option value="year-desc">AÑO DE ESTRENO (NUEVOS)</option>
            <option value="year-asc">AÑO DE ESTRENO (CLÁSICOS)</option>
            <option value="title-asc">TÍTULO (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Matrix Bar (Exact Audioslave Structure) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#111111]/20 font-mono text-[10px] font-bold">
        {/* Library Badge */}
        <div className="bg-[#111111] text-white px-3 py-1 font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
          <span>LIBRARY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]"></span>
        </div>

        {/* TYPE FILTER: ALL | PELÍCULAS | SERIES | ANIME */}
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 uppercase text-[9px] mr-1">TIPO:</span>
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'movie', label: 'PELÍCULA' },
            { id: 'series', label: 'SERIE' },
            { id: 'anime', label: 'ANIME' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onFilterChange({ type: t.id as any })}
              className={`px-2 py-0.8 border border-[#111111] transition-colors cursor-pointer ${
                filters.type === t.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#111111] hover:bg-neutral-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-neutral-300">|</span>

        {/* FORMAT FILTER: ALL | 4K UHD | STEELBOOK | BLU-RAY | CRITERION | DIGITAL */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-neutral-400 uppercase text-[9px] mr-1">FORMATO:</span>
          {[
            { id: 'ALL', label: 'ALL' },
            { id: '4k_uhd', label: '4K UHD' },
            { id: 'steelbook', label: 'STEELBOOK' },
            { id: 'bluray', label: 'BLU-RAY' },
            { id: 'criterion', label: 'CRITERION' },
            { id: 'digital_4k', label: 'DIGITAL 4K' },
            { id: 'PHYSICAL', label: 'TODO FÍSICO' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => onFilterChange({ format: f.id as any })}
              className={`px-2 py-0.8 border border-[#111111] transition-colors cursor-pointer ${
                filters.format === f.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#111111] hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-neutral-300">|</span>

        {/* STATUS FILTER: ALL | VIENDO | BACKLOG | VISTO | OLVIDADOS */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-neutral-400 uppercase text-[9px] mr-1">STATUS:</span>
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'in_progress', label: 'VIENDO' },
            { id: 'backlog', label: 'BACKLOG / POR VER' },
            { id: 'completed', label: 'VISTO' },
            { id: 'rewatch', label: 'RE-WATCH' },
            { id: 'OLVIDADOS', label: 'OLVIDADOS' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => onFilterChange({ status: s.id as any })}
              className={`px-2 py-0.8 border border-[#111111] transition-colors cursor-pointer ${
                filters.status === s.id
                  ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                  : 'bg-white text-[#111111] hover:bg-neutral-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Counter indicator */}
        <div className="ml-auto font-mono text-[10px] text-neutral-500 font-bold">
          MOSTRANDO: <strong className="text-black">{totalFiltered}</strong> / {totalAll}
        </div>
      </div>
    </div>
  );
};
