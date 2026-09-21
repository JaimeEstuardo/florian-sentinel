"use client";
import React from 'react';
import { CollectionTelemetry, MediaItem } from '@/lib/types';
import { BarChart3, AlertCircle, ChevronRight, Play, Eye } from 'lucide-react';

interface AnalyticsSectionProps {
  telemetry: CollectionTelemetry;
  unwatchedItems: MediaItem[];
  onSelectForPlayback: (item: MediaItem) => void;
  onOpenDetail: (item: MediaItem) => void;
  onFilterForgotten: () => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  telemetry,
  unwatchedItems,
  onSelectForPlayback,
  onOpenDetail,
  onFilterForgotten,
}) => {
  return (
    <div className="w-full my-6 border-[2.5px] border-[#111111] bg-white p-4 sm:p-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111111]/20 pb-3 mb-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#FF4D00] uppercase tracking-widest block">
            CRATE ANALYTICS // RADIOGRAFÍA DE LA COLECCIÓN
          </span>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase text-[#111111] font-display">
            DISTRIBUCIÓN, EMPAQUES Y AUDITORÍA DE REPISA
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
          <span className="bg-[#111111] text-white px-2.5 py-1 uppercase">
            {telemetry.totalItems} TÍTULOS
          </span>
          <button
            onClick={onFilterForgotten}
            className="bg-[#FF4D00] hover:bg-[#e04400] text-white px-2.5 py-1 uppercase transition-colors cursor-pointer"
          >
            {telemetry.unwatchedForgottenCount} POR REDESCUBRIR
          </button>
        </div>
      </div>

      {/* 3-Column Grid matching Audioslave screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Column 1: Décadas Cinematográficas (4 Cols) */}
        <div className="lg:col-span-4 border border-[#111111] p-4 bg-[#FFFDF9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-3 text-[10px] font-mono font-bold uppercase text-neutral-600">
              <span>DÉCADAS CINEMATOGRÁFICAS</span>
              <span className="text-neutral-400">LÍNEA TEMPORAL</span>
            </div>

            <div className="space-y-2.5">
              {telemetry.decadesBreakdown.map(dec => (
                <div key={dec.decade} className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] font-bold text-[#111111]">
                    <span>{dec.decade}</span>
                    <span className="text-neutral-500 font-normal">
                      {dec.count} títulos ({dec.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 border border-[#111111]/30">
                    <div
                      className="h-full bg-[#111111] transition-all duration-500"
                      style={{ width: `${Math.max(dec.percentage, dec.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#111111]/10 mt-4 text-[9px] font-mono text-neutral-500 uppercase">
            Frecuencia calculada con base en los años de estreno y prensado.
          </div>
        </div>

        {/* Column 2: Empaques & Top Directores (4 Cols) */}
        <div className="lg:col-span-4 border border-[#111111] p-4 bg-[#FFFDF9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-3 text-[10px] font-mono font-bold uppercase text-neutral-600">
              <span>TIPO DE EMPAQUE / FORMATO</span>
              <span className="text-neutral-400">PACKAGING</span>
            </div>

            {/* Packaging Mini Matrix */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {telemetry.packagingBreakdown.slice(0, 4).map(pkg => (
                <div key={pkg.packaging} className="border border-[#111111] p-2 bg-white">
                  <div className="text-[9px] font-mono font-bold text-neutral-500 uppercase">
                    {pkg.packaging}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black font-display text-[#FF4D00]">
                      {pkg.count}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      {pkg.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Directores */}
            <div className="border-t border-[#111111]/20 pt-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-neutral-600 mb-2">
                <span>TOP DIRECTORES EN ARCHIVO</span>
                <span className="text-neutral-400">TÍTULOS</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {telemetry.topDirectors.map((dir, idx) => (
                  <div key={dir.name} className="flex items-center justify-between py-0.5 border-b border-dashed border-neutral-200">
                    <span className="font-bold text-[#111111]">
                      <span className="text-[#FF4D00] mr-1.5">{idx + 1}.</span>
                      {dir.name}
                    </span>
                    <span className="bg-[#111111] text-white text-[10px] font-bold px-1.5 py-0.2">
                      {dir.count} {dir.count === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[9px] font-mono text-neutral-500 uppercase">
            Clasificación centralizada de hardware y directores.
          </div>
        </div>

        {/* Column 3: Olvidados en la repisa (4 Cols) */}
        <div className="lg:col-span-4 border border-[#111111] p-4 bg-[#FFFDF9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-2 text-[10px] font-mono font-bold uppercase text-neutral-600">
              <span className="flex items-center gap-1 text-[#FF4D00]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>OLVIDADOS EN LA REPISA</span>
              </span>
              <span className="text-neutral-500">{telemetry.unwatchedForgottenCount} PENDIENTES</span>
            </div>

            <p className="font-mono text-[10px] text-neutral-600 mb-3 leading-tight">
              Títulos con 0 visualizaciones registradas o más de 6 meses sin colocar en bandeja:
            </p>

            {/* List of forgotten items */}
            <div className="space-y-2.5">
              {unwatchedItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2 border border-[#111111] p-1.5 bg-white">
                  <div 
                    onClick={() => onOpenDetail(item)}
                    className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-8 h-11 object-cover border border-[#111111] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display font-black text-[11px] uppercase italic text-[#111111] truncate group-hover:text-[#FF4D00]">
                        {item.title}
                      </div>
                      <div className="font-mono text-[9px] text-neutral-500">
                        {item.director} • <span className="font-bold text-neutral-700">{item.format.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectForPlayback(item)}
                    title="Cargar en bandeja y registrar"
                    className="flex items-center gap-1 bg-[#FF4D00] hover:bg-[#e04400] text-white px-2 py-1 text-[9px] font-mono font-bold uppercase border border-[#111111] shrink-0 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>VER HOY</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onFilterForgotten}
            className="w-full mt-4 py-2 border-2 border-[#111111] bg-[#111111] hover:bg-[#222222] text-white font-mono text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
          >
            VER TODOS LOS OLVIDADOS ({telemetry.unwatchedForgottenCount})
          </button>
        </div>
      </div>
    </div>
  );
};
