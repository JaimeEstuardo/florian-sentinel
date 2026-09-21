"use client";
import React from 'react';
import { Plus, Database, Radio, GitBranch, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  totalItems: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenSyncModal,
  totalItems,
}) => {
  return (
    <header className="w-full border-b-[2.5px] border-[#111111] bg-[#F5F4EE] pb-5 pt-4">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6">
        {/* Top Telemetry Info Bar (Exact Florian Archive Style) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono tracking-wider border-b border-[#111111]/20 pb-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="bg-[#111111] text-white px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]">
              FLORIAN_ARCHIVE
            </span>
            <span className="text-neutral-500 font-medium">MODULE_06 // CORE</span>
            <span className="hidden md:inline text-neutral-300">|</span>
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Radio className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span>NODE: <strong className="text-black font-semibold">JAIMEFLORIAN.COM</strong></span>
            </div>
            <span className="hidden md:inline text-neutral-300">|</span>
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>DB: <strong className="text-black font-semibold">JAIMEFLO_SENTINEL</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sync Notion / GitHub button */}
            <button
              onClick={onOpenSyncModal}
              title="Configurar sincronización con Notion y GitHub"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-white border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span className="hidden sm:inline">NOTION / GITHUB SYNC</span>
              <span className="sm:hidden">SYNC</span>
            </button>

            {/* Operational Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#111111] font-mono text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>OPERATIONAL</span>
            </div>

            {/* Primary Action Button (+ NUEVA ENTRADA / NUEVO TÍTULO) */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white px-4 py-1.5 font-mono font-black uppercase text-[12px] tracking-wider border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>NUEVA ENTRADA</span>
            </button>
          </div>
        </div>

        {/* Main Huge Typography Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-[#111111] leading-none uppercase select-none font-display">
              SENTINEL.
            </h1>
            <p className="mt-2 font-mono text-[11px] sm:text-[12px] font-bold tracking-widest text-neutral-600 uppercase">
              SISTEMA DE CONTROL, RADAR Y TELEMETRÍA CINEMATOGRÁFICA // JAIMEFLORIAN.COM
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-600 self-start md:self-end">
            <span className="border border-[#111111] px-2 py-0.5 bg-white font-bold text-[#111111]">
              CINE • SERIES • ANIME
            </span>
            <span className="border border-[#111111] px-2 py-0.5 bg-white font-bold text-[#111111]">
              4K UHD • BD • STEELBOOK • DIGITAL
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
