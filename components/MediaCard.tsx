import React from 'react';
import { MediaItem } from '../types';
import { Play, PlusCircle, FileText, Edit2, Trash2, Star, Disc, CheckCircle } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onOpenDetail: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onQuickLog: (item: MediaItem) => void;
  onSelectForPlayback: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpenDetail,
  onEdit,
  onDelete,
  onQuickLog,
  onSelectForPlayback,
  onToggleFavorite,
}) => {
  // Format badge label
  const formatBadge = item.packaging === 'STEELBOOK' 
    ? 'STEELBOOK' 
    : (item.format === '4k_uhd' ? '4K UHD' : item.format.replace('_', ' ').toUpperCase());

  // Status styling
  const statusConfig = {
    completed: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', label: 'VISTO' },
    in_progress: { bg: 'bg-[#FF4D00] text-white border-[#111111]', label: 'VIENDO' },
    backlog: { bg: 'bg-amber-100 text-amber-900 border-amber-300', label: 'POR VER' },
    rewatch: { bg: 'bg-blue-100 text-blue-900 border-blue-300', label: 'RE-WATCH' },
    abandoned: { bg: 'bg-neutral-200 text-neutral-700 border-neutral-400', label: 'DESCARTADO' },
  }[item.status] || { bg: 'bg-neutral-100 text-neutral-800 border-neutral-300', label: item.status.toUpperCase() };

  return (
    <div className="border-[2.5px] border-[#111111] bg-white p-3.5 sm:p-4 hover:shadow-[3px_3px_0px_0px_#111111] transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Status + Actions + Watch Count Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 font-mono text-[9px] font-black uppercase border ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
            <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">
              {item.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite Star */}
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-1 hover:scale-110 transition-transform cursor-pointer"
              title={item.isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  item.isFavorite ? 'fill-[#FF4D00] text-[#FF4D00]' : 'text-neutral-300 hover:text-neutral-500'
                }`}
              />
            </button>

            {/* Watch count circle (Exact Audioslave top right circle) */}
            <div
              title={`${item.watchCount} reproducciones / visionados`}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-black border border-[#111111] ${
                item.watchCount > 0 ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {item.watchCount}
            </div>

            {/* Delete button */}
            <button
              onClick={() => onDelete(item.id)}
              className="text-neutral-300 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
              title="Eliminar registro"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle Body: Image on left + Core Info on right */}
        <div className="flex gap-3.5">
          {/* Poster image */}
          <div
            onClick={() => onOpenDetail(item)}
            className="relative w-24 sm:w-28 h-36 sm:h-40 shrink-0 border-2 border-[#111111] bg-neutral-900 overflow-hidden cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
          >
            <img
              src={item.posterUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Format Tag in bottom corner */}
            <div className="absolute bottom-0 left-0 bg-[#111111] text-white font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
              {formatBadge}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3
                onClick={() => onOpenDetail(item)}
                className="font-display font-black text-lg sm:text-xl uppercase italic text-[#111111] tracking-tight hover:text-[#FF4D00] cursor-pointer leading-tight line-clamp-2"
                title={item.title}
              >
                {item.title}
              </h3>

              <div className="font-mono text-[11px] font-bold text-blue-700 uppercase mt-0.5 truncate">
                {item.director} • <span className="text-neutral-600">{item.year}</span>
              </div>

              {/* Technical tag */}
              <div className="font-mono text-[10px] text-neutral-500 uppercase mt-1 line-clamp-1">
                <span className="font-bold text-neutral-800">FMT:</span> {item.packaging} ({item.format.replace('_', ' ')})
                {item.runtime && <span> • {item.runtime}</span>}
              </div>

              {/* Ratings Badges Bar */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2 font-mono text-[9px] font-bold">
                {item.ratings.imdb > 0 && (
                  <a
                    href={item.imdbUrl || `https://www.imdb.com/find/?q=${encodeURIComponent(item.title + ' ' + item.year)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#F5C518] hover:bg-[#e3b514] text-black px-1.5 py-0.2 border border-black/40 cursor-pointer inline-flex items-center gap-0.5"
                    title="Ver ficha en IMDb"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>IMDb {item.ratings.imdb}</span>
                    <span className="text-[7px]">↗</span>
                  </a>
                )}
                {item.ratings.rottenTomatoes > 0 && (
                  <span className="bg-[#FA320A] text-white px-1.5 py-0.2 border border-black/40">
                    RT {item.ratings.rottenTomatoes}%
                  </span>
                )}
                {item.ratings.metacritic > 0 && (
                  <span className="bg-[#333333] text-white px-1.5 py-0.2 border border-black/40">
                    META {item.ratings.metacritic}
                  </span>
                )}
                {item.ratings.personal > 0 && (
                  <span className="bg-[#FF4D00] text-white px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_0px_black]">
                    ★ JAIME {item.ratings.personal}
                  </span>
                )}
              </div>
            </div>

            {/* Last Watched & Location */}
            <div className="mt-2 text-[10px] font-mono text-neutral-500 uppercase border-t border-neutral-200 pt-1.5 flex items-center justify-between">
              <span>
                {item.lastWatched ? `LOG: ${item.lastWatched}` : 'SIN VISIONADO'}
              </span>
              {item.location && (
                <span className="truncate max-w-[110px]" title={item.location}>
                  {item.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Synopsis or User Review preview */}
        <p className="font-mono text-[10px] text-neutral-600 mt-2.5 line-clamp-2 leading-relaxed bg-[#FAF9F5] p-1.5 border border-neutral-200">
          {item.userReview ? `"${item.userReview}"` : item.synopsis}
        </p>
      </div>

      {/* Action Buttons Footer */}
      <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-[#111111]/20 font-mono text-[10px] font-bold uppercase">
        {/* Tray / Bandeja button */}
        <button
          onClick={() => onSelectForPlayback(item)}
          className="flex items-center justify-center gap-1 bg-[#111111] hover:bg-[#222222] text-white py-1.5 border border-[#111111] cursor-pointer transition-colors"
          title="Cargar en monitor de sesión"
        >
          <Play className="w-2.5 h-2.5 fill-white" />
          <span className="hidden sm:inline">BANDEJA</span>
        </button>

        {/* Quick Log button */}
        <button
          onClick={() => onQuickLog(item)}
          className="flex items-center justify-center gap-1 bg-[#FF4D00] hover:bg-[#e04400] text-white py-1.5 border border-[#111111] cursor-pointer transition-colors"
          title="Registrar que lo viste hoy (+1)"
        >
          <PlusCircle className="w-3 h-3" />
          <span>+LOG</span>
        </button>

        {/* Ficha & Notas button */}
        <button
          onClick={() => onOpenDetail(item)}
          className="flex items-center justify-center gap-1 bg-white hover:bg-neutral-100 text-[#111111] py-1.5 border border-[#111111] cursor-pointer transition-colors"
          title="Ver ficha técnica completa y bitácora"
        >
          <FileText className="w-3 h-3" />
          <span className="hidden sm:inline">NOTAS</span>
        </button>

        {/* Editar button */}
        <button
          onClick={() => onEdit(item)}
          className="flex items-center justify-center gap-1 bg-white hover:bg-neutral-100 text-[#111111] py-1.5 border border-[#111111] cursor-pointer transition-colors"
          title="Editar metadatos"
        >
          <Edit2 className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">EDIT</span>
        </button>
      </div>
    </div>
  );
};
