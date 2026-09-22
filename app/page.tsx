"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem, FilterState } from '@/lib/types';
import { INITIAL_CATALOG } from '@/lib/initialCatalog';
import { calculateTelemetry } from '@/lib/telemetry';
import { Header } from '@/components/Header';
import { TelemetryBar } from '@/components/TelemetryBar';
import { RadarDigger } from '@/components/RadarDigger';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { FilterControls } from '@/components/FilterControls';
import { MediaCard } from '@/components/MediaCard';
import { TopArchiveSidebar } from '@/components/TopArchiveSidebar';
import { AddMediaModal } from '@/components/AddMediaModal';
import { MediaDetailModal } from '@/components/MediaDetailModal';
import { QuickLogModal } from '@/components/QuickLogModal';
import { NotionGithubSyncModal } from '@/components/NotionGithubSyncModal';
import { Film } from 'lucide-react';

const STORAGE_KEY = 'sentinel_catalog_v2';
const TRAY_STORAGE_KEY = 'sentinel_active_tray_v1';

export default function Page() {
  const [items, setItems] = useState<MediaItem[]>(INITIAL_CATALOG);
  const [activeTrayItem, setActiveTrayItem] = useState<MediaItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTargetItem, setEditTargetItem] = useState<MediaItem | null>(null);
  const [detailTargetItem, setDetailTargetItem] = useState<MediaItem | null>(null);
  const [quickLogTargetItem, setQuickLogTargetItem] = useState<MediaItem | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    format: 'ALL',
    packaging: 'ALL',
    status: 'ALL',
    genre: '',
    decade: '',
    sortBy: 'lastWatched',
    sortOrder: 'desc',
  });

  // Client hydration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
      const savedTray = localStorage.getItem(TRAY_STORAGE_KEY);
      if (savedTray) {
        setActiveTrayItem(JSON.parse(savedTray));
      } else {
        setActiveTrayItem(INITIAL_CATALOG[0] || null);
      }
    } catch (e) {
      console.error('Error restoring storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when catalog changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (activeTrayItem) {
        localStorage.setItem(TRAY_STORAGE_KEY, JSON.stringify(activeTrayItem));
      } else {
        localStorage.removeItem(TRAY_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
  }, [activeTrayItem, isLoaded]);

  // Compute telemetry metrics
  const telemetry = useMemo(() => calculateTelemetry(items), [items]);

  // Filtered and Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDirector = item.director.toLowerCase().includes(q);
        const matchesStudio = item.studio?.toLowerCase().includes(q);
        const matchesGenres = item.genres.some(g => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDirector && !matchesStudio && !matchesGenres) return false;
      }

      // Type
      if (filters.type !== 'ALL' && item.type !== filters.type) return false;

      // Format
      if (filters.format === 'PHYSICAL') {
        if (item.packaging === 'DIGITAL' || item.format === 'streaming' || item.format === 'digital_4k') return false;
      } else if (filters.format === 'DIGITAL') {
        if (item.packaging !== 'DIGITAL' && item.format !== 'streaming' && item.format !== 'digital_4k') return false;
      } else if (filters.format !== 'ALL' && item.format !== filters.format) {
        return false;
      }

      // Status
      if (filters.status === 'OLVIDADOS') {
        if (item.watchCount > 0 && item.lastWatched) {
          const now = new Date().getTime();
          const diff = now - new Date(item.lastWatched).getTime();
          if (diff < 180 * 24 * 60 * 60 * 1000) return false;
        }
      } else if (filters.status !== 'ALL' && item.status !== filters.status) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (filters.sortBy) {
        case 'lastWatched':
          valA = a.lastWatched ? new Date(a.lastWatched).getTime() : 0;
          valB = b.lastWatched ? new Date(b.lastWatched).getTime() : 0;
          break;
        case 'watchCount':
          valA = a.watchCount || 0;
          valB = b.watchCount || 0;
          break;
        case 'personalRating':
          valA = a.ratings.personal || 0;
          valB = b.ratings.personal || 0;
          break;
        case 'imdb':
          valA = a.ratings.imdb || 0;
          valB = b.ratings.imdb || 0;
          break;
        case 'year':
          valA = a.year || 0;
          valB = b.year || 0;
          break;
        case 'title':
        default:
          valA = a.title;
          valB = b.title;
          break;
      }

      if (typeof valA === 'string') {
        return filters.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [items, filters]);

  // Items with 0 views or unwatched
  const unwatchedItems = useMemo(() => {
    return items.filter(i => i.watchCount === 0 || !i.lastWatched);
  }, [items]);

  // Handlers
  const handleSaveMedia = (itemData: Omit<MediaItem, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'>) => {
    if (editTargetItem) {
      setItems(prev => prev.map(item => {
        if (item.id === editTargetItem.id) {
          return {
            ...item,
            ...itemData,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      }));
      setEditTargetItem(null);
    } else {
      const nextCodeNum = items.length + 1;
      const newItem: MediaItem = {
        ...itemData,
        id: `sen-${Date.now()}`,
        code: `SEN_${String(nextCodeNum).padStart(3, '0')}`,
        history: itemData.status === 'completed' ? [{
          id: `h-${Date.now()}`,
          date: itemData.lastWatched || new Date().toISOString().split('T')[0],
          note: itemData.userReview || 'Primer registro inicial en el archivo.',
          rating: itemData.ratings.personal,
          formatWatched: itemData.packaging,
        }] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItems(prev => [newItem, ...prev]);
    }
  };

  const handleDeleteMedia = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (window.confirm(`¿Confirmas la eliminación del título "${item.title}" del archivo Sentinel?`)) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (activeTrayItem?.id === id) {
        setActiveTrayItem(null);
      }
      if (detailTargetItem?.id === id) {
        setDetailTargetItem(null);
      }
    }
  };

  const handleQuickLog = (itemId: string, note: string, rating: number, date: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newEntry = {
          id: `h-${Date.now()}`,
          date,
          note: note || `Sesión de visionado registrada.`,
          rating,
          formatWatched: item.format,
        };
        return {
          ...item,
          watchCount: (item.watchCount || 0) + 1,
          status: 'completed',
          lastWatched: date,
          userReview: note ? note : item.userReview,
          history: [newEntry, ...(item.history || [])],
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    }));
  };

  const handleToggleFavorite = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    }));
  };

  const handleSelectForPlayback = (item: MediaItem) => {
    setActiveTrayItem(item);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleImportItems = (newItems: MediaItem[]) => {
    setItems(prev => {
      const existingIds = new Set(prev.map(i => i.title.trim().toUpperCase()));
      const filtered = newItems.filter(i => !existingIds.has(i.title.trim().toUpperCase()));
      return [...prev, ...filtered];
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F4EE] text-[#111111] flex flex-col selection:bg-[#FF4D00] selection:text-white">
      {/* Top Header matching Audioslave / Bookworm */}
      <Header
        onOpenAddModal={() => {
          setEditTargetItem(null);
          setIsAddModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        totalItems={items.length}
      />

      {/* Main Container */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 py-2 flex-1 w-full">
        {/* KPI Telemetry & Cadence Bar */}
        <TelemetryBar
          telemetry={telemetry}
          onFilterActive={() => setFilters(prev => ({ ...prev, status: 'in_progress' }))}
          onFilterCompleted={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
          onFilterAll={() => setFilters(prev => ({ ...prev, status: 'ALL' }))}
        />

        {/* Crate Digger / Radar Sugerencia Aleatoria */}
        <RadarDigger
          items={items}
          onSelectForPlayback={handleSelectForPlayback}
          onOpenDetail={(item) => setDetailTargetItem(item)}
        />

        {/* Analytics Section: Décadas, Empaques, Olvidados en la repisa */}
        <AnalyticsSection
          telemetry={telemetry}
          unwatchedItems={unwatchedItems}
          onSelectForPlayback={handleSelectForPlayback}
          onOpenDetail={(item) => setDetailTargetItem(item)}
          onFilterForgotten={() => setFilters(prev => ({ ...prev, status: 'OLVIDADOS' }))}
        />

        {/* Filter Controls Bar */}
        <FilterControls
          filters={filters}
          onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          totalFiltered={filteredItems.length}
          totalAll={items.length}
        />

        {/* Main Content Layout: Catalog Grid (8-9 Cols) + Top Archive Sidebar (3-4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
          {/* Catalog Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onOpenDetail={(it) => setDetailTargetItem(it)}
                    onEdit={(it) => {
                      setEditTargetItem(it);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeleteMedia}
                    onQuickLog={(it) => setQuickLogTargetItem(it)}
                    onSelectForPlayback={handleSelectForPlayback}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="border-[2.5px] border-[#111111] bg-white p-12 text-center">
                <Film className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
                <h3 className="font-display font-black text-xl uppercase italic text-[#111111] mb-1">
                  NO SE ENCONTRARON TÍTULOS CON ESTE CRITERIO
                </h3>
                <p className="font-mono text-xs text-neutral-500 uppercase mb-4">
                  Ajusta los filtros de búsqueda, formato o estado para ver más registros.
                </p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    type: 'ALL',
                    format: 'ALL',
                    packaging: 'ALL',
                    status: 'ALL',
                    genre: '',
                    decade: '',
                    sortBy: 'lastWatched',
                    sortOrder: 'desc',
                  })}
                  className="px-4 py-2 bg-[#FF4D00] text-white font-mono text-xs font-black uppercase border-2 border-[#111111] cursor-pointer"
                >
                  RESTAURAR TODOS LOS FILTROS
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Active Tray & Top Archive */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-4">
              <TopArchiveSidebar
                topItems={telemetry.topRewatched}
                activeTrayItem={activeTrayItem}
                onOpenDetail={(item) => setDetailTargetItem(item)}
                onQuickLog={(item) => setQuickLogTargetItem(item)}
                onClearTray={() => setActiveTrayItem(null)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-[2.5px] border-[#111111] bg-white py-4 mt-12">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="bg-[#111111] text-white px-2 py-0.5 font-bold">
              SENTINEL // FLORIAN ARCHIVE
            </span>
            <span>JAIMEFLORIAN.COM MODULE 06</span>
          </div>
          <div className="flex items-center gap-3">
            <span>NASA-PUNK SYSTEM PROTOCOL</span>
            <span>•</span>
            <span>{items.length} VOLÚMENES AUDITADOS</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">100% PERSISTENCIA LOCAL & CLOUD</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditTargetItem(null);
        }}
        onSave={handleSaveMedia}
        editItem={editTargetItem}
      />

      <MediaDetailModal
        item={detailTargetItem}
        onClose={() => setDetailTargetItem(null)}
        onEdit={(item) => {
          setDetailTargetItem(null);
          setEditTargetItem(item);
          setIsAddModalOpen(true);
        }}
        onSelectForPlayback={handleSelectForPlayback}
        onAddHistoryNote={(id, note, rating) => {
          handleQuickLog(id, note, rating || 10, new Date().toISOString().split('T')[0]);
          const updated = items.find(i => i.id === id);
          if (updated) setDetailTargetItem({ ...updated });
        }}
      />

      <QuickLogModal
        item={quickLogTargetItem}
        onClose={() => setQuickLogTargetItem(null)}
        onConfirmLog={handleQuickLog}
      />

      <NotionGithubSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        items={items}
        onImportItems={handleImportItems}
      />
    </div>
  );
}
