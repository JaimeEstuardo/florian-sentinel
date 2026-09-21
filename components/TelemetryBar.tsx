"use client";
import React from 'react';
import { CollectionTelemetry } from '@/lib/types';
import { Film, Activity, CheckCircle2, Clock, Flame, Database } from 'lucide-react';

interface TelemetryBarProps {
  telemetry: CollectionTelemetry;
  onFilterActive: () => void;
  onFilterCompleted: () => void;
  onFilterAll: () => void;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  telemetry,
  onFilterActive,
  onFilterCompleted,
  onFilterAll,
}) => {
  return (
    <div className="w-full space-y-3.5 my-5">
      {/* 4 KPI Brutalist Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Volumes / Titles */}
        <div 
          onClick={onFilterAll}
          className="border-[2.5px] border-[#111111] bg-white p-4.5 cursor-pointer hover:bg-[#FAF9F5] transition-colors relative"
        >
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1">
            <span>TOTAL_TITLES</span>
            <Database className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-4xl sm:text-5xl font-black italic tracking-tighter text-[#111111] font-display leading-tight">
            {telemetry.totalItems}
          </div>
          <div className="mt-1 text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between">
            <span>{telemetry.physicalCount} FÍSICO / {telemetry.digitalCount} DIGITAL</span>
            <span className="text-neutral-400">ARCHIVE_ID</span>
          </div>
        </div>

        {/* Card 2: Active Processing (Highlighted in Orange like in Bookworm) */}
        <div 
          onClick={onFilterActive}
          className="border-[2.5px] border-[#111111] bg-[#FF4D00] text-white p-4.5 cursor-pointer hover:bg-[#f04500] transition-colors relative shadow-[2px_2px_0px_0px_#111111]"
        >
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-white/90 mb-1">
            <span>ACTIVE_PROCESSING</span>
            <Activity className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white font-display leading-tight">
            {telemetry.activeProcessing}
          </div>
          <div className="mt-1 text-[10px] font-mono text-white/80 uppercase tracking-widest flex items-center justify-between">
            <span>EN VISUALIZACIÓN ACTIVA</span>
            <span className="font-bold underline">VER LISTA</span>
          </div>
        </div>

        {/* Card 3: Completed Cycles */}
        <div 
          onClick={onFilterCompleted}
          className="border-[2.5px] border-[#111111] bg-white p-4.5 cursor-pointer hover:bg-[#FAF9F5] transition-colors relative"
        >
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1">
            <span>COMPLETED_CYCLES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-4xl sm:text-5xl font-black italic tracking-tighter text-[#111111] font-display leading-tight">
            {telemetry.completedCycles}
          </div>
          <div className="mt-1 text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between">
            <span>VISTOS & RE-WATCHES</span>
            <span className="text-emerald-700 font-bold">100% AUDITADO</span>
          </div>
        </div>

        {/* Card 4: Hours Logged */}
        <div className="border-[2.5px] border-[#111111] bg-white p-4.5 relative">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1">
            <span>HOURS_LOGGED</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-4xl sm:text-5xl font-black italic tracking-tighter text-[#111111] font-display leading-tight">
            {telemetry.totalHoursWatched}
            <span className="text-xl sm:text-2xl font-normal text-neutral-400 ml-1">HRS</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between">
            <span>TIEMPO TOTAL DE PANTALLA</span>
            <span className="text-neutral-400">TELEMETRY_LOG</span>
          </div>
        </div>
      </div>

      {/* Telemetry Streak & Cadence 14 Días Bar (Exact Bookworm Bar) */}
      <div className="border-[2.5px] border-[#111111] bg-white p-3 sm:px-5 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Streak indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 border border-[#111111] bg-[#FAF9F5] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-[#FF4D00]" />
          </div>
          <div className="font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                TELEMETRY_STREAK
              </span>
              <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40 px-1.5 py-0.2 uppercase">
                SESIÓN REGISTRADA HOY
              </span>
            </div>
            <div className="text-sm font-bold uppercase text-[#111111] tracking-tight">
              <span className="text-base font-black text-[#FF4D00]">{telemetry.watchStreakDays}</span> DÍAS CONSECUTIVOS DE ACTIVIDAD
            </div>
          </div>
        </div>

        {/* Right: Cadencia 14 Días grid */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px] font-mono font-bold uppercase text-neutral-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FF4D00]" />
            <span>CADENCIA (14 DÍAS):</span>
          </div>
          <div className="flex items-center gap-1">
            {telemetry.cadenceDays.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[8px] font-mono font-bold text-neutral-400 mb-0.5">{item.dayLabel}</span>
                <div
                  title={`${item.date}: ${item.count} sesiones`}
                  className={`w-5 h-5 sm:w-6 sm:h-6 border border-[#111111] flex items-center justify-center text-[10px] font-bold transition-all ${
                    item.active
                      ? 'bg-[#FF4D00] text-white'
                      : 'bg-white text-transparent hover:bg-neutral-100'
                  }`}
                >
                  {item.active ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
