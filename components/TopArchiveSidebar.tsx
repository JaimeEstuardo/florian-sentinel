"use client";
import React from 'react';
import { MediaItem } from '@/lib/types';
import { Trophy, Play, CheckCircle, Disc, Volume2, Monitor } from 'lucide-react';

interface TopArchiveSidebarProps {
  topItems: MediaItem[];
  activeTrayItem: MediaItem | null;
  onOpenDetail: (item: MediaItem) => void;
  onQuickLog: (item: MediaItem) => void;
  onClearTray: () => void;
}

export const TopArchiveSidebar: React.FC<TopArchiveSidebarProps> = ({
  topItems,
  activeTrayItem,
  onOpenDetail,
  onQuickLog,
  onClearTray,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Active Tray Monitor (Monitor de Bandeja Activa) */}
      <div className="border-[2.5px] border-[#111111] bg-white p-4">
        <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase text-[#111111]">
            <Disc className="w-3.5 h-3.5 text-[#FF4D00] animate-spin" style={{ animationDuration: '8s' }} />
            <span>BANDEJA // EN MONITOR</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {activeTrayItem ? (
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <img
                src={activeTrayItem.posterUrl}
                alt={activeTrayItem.title}
                className="w-14 h-20 object-cover border border-[#111111] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono font-bold text-[#FF4D00] uppercase block">
                  SESIÓN EN CURSO
                </span>
                <h4
                  onClick={() => onOpenDetail(activeTrayItem)}
                  className="font-display font-black text-sm uppercase italic text-[#111111] leading-tight truncate hover:text-[#FF4D00] cursor-pointer"
                >
                  {activeTrayItem.title}
                </h4>
                <div className="font-mono text-[10px] text-blue-700 uppercase truncate">
                  {activeTrayItem.director}
                </div>
                <div className="font-mono text-[9px] text-neutral-500 uppercase mt-1">
                  {activeTrayItem.format.replace('_', ' ').toUpperCase()} • {activeTrayItem.packaging}
                </div>
              </div>
            </div>

            {/* Hardware Specs Display */}
            <div className="bg-[#FAF9F5] border border-[#111111]/30 p-2 font-mono text-[9px] space-y-1">
              <div className="flex items-center gap-1 text-neutral-700">
                <Volume2 className="w-3 h-3 text-[#FF4D00]" />
                <span className="truncate">{activeTrayItem.audioSpecs || 'Dolby Atmos / DTS Master Audio'}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-700">
                <Monitor className="w-3 h-3 text-blue-700" />
                <span className="truncate">{activeTrayItem.videoSpecs || '4K HDR10+ / Dolby Vision'}</span>
              </div>
            </div>

            {/* Action buttons for tray */}
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] font-bold">
              <button
                onClick={() => onQuickLog(activeTrayItem)}
                className="flex-1 bg-[#FF4D00] hover:bg-[#e04400] text-white py-1.5 border border-[#111111] uppercase tracking-wider text-center cursor-pointer transition-colors"
              >
                ✓ COMPLETAR SESIÓN
              </button>
              <button
                onClick={onClearTray}
                className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-[#111111] border border-[#111111] cursor-pointer"
                title="Quitar de bandeja"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-8 h-8 mx-auto mb-2 border border-dashed border-neutral-400 flex items-center justify-center text-neutral-400">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
            <p className="font-mono text-[10px] text-neutral-500 uppercase">
              Bandeja vacía. Haz clic en "BANDEJA" en cualquier título para cargarlo en el monitor.
            </p>
          </div>
        )}
      </div>

      {/* Top Archive Sidebar (Exact Audioslave Layout) */}
      <div className="border-[2.5px] border-[#111111] bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-3 text-[10px] font-mono font-bold uppercase text-neutral-600">
          <span className="flex items-center gap-1.5 text-[#111111]">
            <Trophy className="w-3.5 h-3.5 text-[#FF4D00]" />
            <span>TOP_ARCHIVE</span>
          </span>
          <span className="text-neutral-500">PLAY_COUNT</span>
        </div>

        {/* Ranked List 01 - 06 */}
        <div className="space-y-2 font-mono">
          {topItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onOpenDetail(item)}
              className="flex items-center justify-between gap-2 p-1.5 border border-transparent hover:border-[#111111] hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black text-[#FF4D00]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="font-display font-black text-xs uppercase italic text-[#111111] truncate group-hover:text-[#FF4D00] leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[9px] text-neutral-500 uppercase truncate">
                    {item.director}
                  </div>
                </div>
              </div>

              {/* Orange Count Badge */}
              <div className="bg-[#FF4D00] text-white font-mono text-[10px] font-black px-2 py-0.5 border border-[#111111] shrink-0">
                {String(item.watchCount).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#111111]/10 mt-3 flex items-center justify-between text-[8px] font-mono text-neutral-500 uppercase">
          <span>LOGGED SESSIONS RANK</span>
          <span className="text-emerald-700 font-bold">● LIVE TELEMETRY</span>
        </div>
      </div>
    </div>
  );
};
