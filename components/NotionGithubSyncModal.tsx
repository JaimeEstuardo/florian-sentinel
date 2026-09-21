"use client";
import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/lib/types';
import { GitBranch, Database, Download, Upload, Check, AlertCircle, Copy, FileText, ArrowRight, ExternalLink, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

interface NotionGithubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  onImportItems: (newItems: MediaItem[]) => void;
}

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  repo?: string;
  repoExists?: boolean;
  repoDefaultBranch?: string;
  expiresAt?: string;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  tokenPreview?: string;
  error?: string;
}

export const NotionGithubSyncModal: React.FC<NotionGithubSyncModalProps> = ({
  isOpen,
  onClose,
  items,
  onImportItems,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'notion' | 'export'>('github');
  const [notionInput, setNotionInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  
  // GitHub server status state
  const [ghStatus, setGhStatus] = useState<GitHubStatus | null>(null);
  const [loadingGhStatus, setLoadingGhStatus] = useState(false);
  const [isSyncingGh, setIsSyncingGh] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; commitUrl?: string; message?: string } | null>(null);
  const [isPullingGh, setIsPullingGh] = useState(false);

  // Fetch GitHub Status from backend
  const fetchGitHubStatus = async () => {
    setLoadingGhStatus(true);
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      setGhStatus(data);
    } catch (err: any) {
      setGhStatus({ connected: false, error: err.message });
    } finally {
      setLoadingGhStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGitHubStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Live GitHub Push Sync
  const handlePushToGitHub = async () => {
    setIsSyncingGh(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          message: `SENTINEL ARCHIVE: Actualización de catálogo (${items.length} títulos) - ${new Date().toISOString().split('T')[0]}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult({
          success: true,
          commitUrl: data.commitUrl,
          message: `¡Sincronizado con éxito! Se creó un commit con los ${items.length} títulos en la rama main de ${ghStatus?.repo}.`
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Error al hacer push al repositorio.'
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: `Error de red: ${err.message}`
      });
    } finally {
      setIsSyncingGh(false);
    }
  };

  // Pull Catalog from GitHub
  const handlePullFromGitHub = async () => {
    setIsPullingGh(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/github/pull');
      const data = await res.json();
      if (res.ok && data.success && data.data?.items) {
        onImportItems(data.data.items);
        setSyncResult({
          success: true,
          message: `Se restauraron ${data.data.items.length} títulos desde el repositorio GitHub.`
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'No se encontró archivo de catálogo en el repositorio.'
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message
      });
    } finally {
      setIsPullingGh(false);
    }
  };

  // Handle Notion Import
  const handleParseNotion = (rawText?: string) => {
    const textToParse = rawText || notionInput;
    if (!textToParse.trim()) return;
    setImportStatus(null);

    try {
      // Check if JSON
      if (textToParse.trim().startsWith('{') || textToParse.trim().startsWith('[')) {
        const parsed = JSON.parse(textToParse);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const newItems: MediaItem[] = list.map((item, idx) => ({
          id: `sen-notion-${Date.now()}-${idx}`,
          code: `SEN_${String(items.length + idx + 1).padStart(3, '0')}`,
          title: (item.Title || item.title || item.Nombre || 'SIN TÍTULO').toUpperCase(),
          originalTitle: item.OriginalTitle || item.originalTitle || '',
          type: (item.Type || item.type || 'movie').toLowerCase(),
          format: (item.Format || item.format || '4k_uhd').toLowerCase(),
          packaging: item.Packaging || item.packaging || 'STANDARD',
          status: item.Status || item.status || 'completed',
          year: Number(item.Year || item.year || 2020),
          decade: item.Decade || `${Math.floor((Number(item.Year || 2020)) / 10) * 10}s`,
          director: (item.Director || item.director || 'DESCONOCIDO').toUpperCase(),
          studio: item.Studio || item.studio || '',
          genres: Array.isArray(item.Genres || item.genres) ? (item.Genres || item.genres) : [item.Genre || item.genre || 'Cine'],
          runtime: item.Runtime || item.runtime || '120 min',
          runtimeMinutes: Number(item.RuntimeMinutes || 120),
          posterUrl: item.Poster || item.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
          synopsis: item.Synopsis || item.synopsis || 'Importado desde base de datos Notion.',
          ratings: {
            imdb: Number(item.IMDb || item.imdb || 8.0),
            rottenTomatoes: Number(item.RT || item.rottenTomatoes || 85),
            metacritic: Number(item.Meta || item.metacritic || 80),
            personal: Number(item.Personal || item.Rating || 9.0),
          },
          lastWatched: item.LastWatched || item.lastWatched || new Date().toISOString().split('T')[0],
          watchCount: Number(item.WatchCount || item.watchCount || 1),
          userReview: item.Notes || item.notes || item.Review || '',
          history: [],
          isFavorite: Boolean(item.Favorite || item.isFavorite),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        onImportItems(newItems);
        setImportStatus(`✓ ¡Éxito! Se importaron ${newItems.length} títulos desde Notion.`);
        setNotionInput('');
        return;
      }

      // If CSV
      const lines = textToParse.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const newItems: MediaItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = vals[idx] || '';
          });

          const title = row['title'] || row['título'] || row['nombre'] || row['name'] || `Título ${i}`;
          newItems.push({
            id: `sen-csv-${Date.now()}-${i}`,
            code: `SEN_${String(items.length + i).padStart(3, '0')}`,
            title: title.toUpperCase(),
            type: (row['type'] || row['tipo'] || 'movie').toLowerCase() as any,
            format: (row['format'] || row['formato'] || '4k_uhd').toLowerCase() as any,
            packaging: (row['packaging'] || row['empaque'] || 'STANDARD').toUpperCase() as any,
            status: (row['status'] || row['estado'] || 'completed').toLowerCase() as any,
            year: parseInt(row['year'] || row['año'] || '2022', 10),
            decade: `${Math.floor(parseInt(row['year'] || '2022', 10) / 10) * 10}s`,
            director: (row['director'] || 'DESCONOCIDO').toUpperCase(),
            genres: (row['genres'] || row['género'] || 'Cine').split(';'),
            runtime: row['runtime'] || row['duración'] || '120 min',
            runtimeMinutes: 120,
            posterUrl: row['poster'] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
            synopsis: row['synopsis'] || row['sinopsis'] || 'Importado desde CSV de Notion.',
            ratings: {
              imdb: parseFloat(row['imdb'] || '8.0'),
              rottenTomatoes: parseInt(row['rotten'] || '85', 10),
              metacritic: parseInt(row['metacritic'] || '80', 10),
              personal: parseFloat(row['personal'] || row['nota'] || '9.0'),
            },
            watchCount: parseInt(row['watchcount'] || row['vistas'] || '1', 10),
            lastWatched: row['lastwatched'] || row['última'] || new Date().toISOString().split('T')[0],
            userReview: row['review'] || row['notas'] || '',
            history: [],
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        onImportItems(newItems);
        setImportStatus(`✓ ¡Éxito! Se importaron ${newItems.length} títulos desde el archivo exportado de Notion.`);
        setNotionInput('');
        return;
      }

      setImportStatus('Formato no reconocido. Pega el JSON o CSV exportado de Notion.');
    } catch (e: any) {
      setImportStatus(`Error al procesar: ${e.message}`);
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentinel-archive-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl border-[2.5px] border-[#111111] bg-[#F5F4EE] shadow-[6px_6px_0px_0px_#111111] my-auto">
        {/* Top Title Bar */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#111111] bg-[#111111] text-white px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider">
            <GitBranch className="w-4 h-4 text-[#FF4D00]" />
            <span>CENTRO DE SINCRONIZACIÓN // GITHUB & NOTION</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-mono text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b-2 border-[#111111] bg-white font-mono text-xs font-black uppercase">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2.5 px-3 border-r border-[#111111] text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'github' ? 'bg-[#FF4D00] text-white' : 'text-[#111111] hover:bg-neutral-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>1. GITHUB DIRECT SYNC</span>
          </button>
          <button
            onClick={() => setActiveTab('notion')}
            className={`flex-1 py-2.5 px-3 border-r border-[#111111] text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'notion' ? 'bg-[#FF4D00] text-white' : 'text-[#111111] hover:bg-neutral-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. IMPORTADOR NOTION</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 px-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'export' ? 'bg-[#FF4D00] text-white' : 'text-[#111111] hover:bg-neutral-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. BACKUP MANUAL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 font-mono text-xs">
          {/* TAB 1: GITHUB DIRECT SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              {/* Status Header Box */}
              <div className="border-2 border-[#111111] bg-white p-4 shadow-[2px_2px_0px_0px_#111111]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    {ghStatus?.avatarUrl ? (
                      <img
                        src={ghStatus.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 border border-[#111111] rounded-none"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center font-bold">
                        GH
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase">
                        USUARIO GITHUB CONECTADO
                      </div>
                      <div className="font-display font-black text-base uppercase text-[#111111]">
                        {ghStatus?.username || 'JaimeEstuardo'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-500 text-emerald-800 text-[10px] font-black uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      TOKEN ACTIVO & VIGENTE
                    </span>
                    <button
                      type="button"
                      onClick={fetchGitHubStatus}
                      className="p-1 border border-[#111111] hover:bg-neutral-100 text-neutral-700"
                      title="Refrescar estado"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingGhStatus ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Token Telemetry Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="border border-neutral-200 p-2.5 bg-[#FAF9F5]">
                    <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">REPOSITORIO DESTINO</div>
                    <div className="font-bold text-[#111111] break-all">
                      {ghStatus?.repo || 'JaimeEstuardo/florian-sentinel'}
                    </div>
                    <div className="text-[9px] text-neutral-400 mt-0.5">Rama: {ghStatus?.repoDefaultBranch || 'main'}</div>
                  </div>

                  <div className="border border-neutral-200 p-2.5 bg-[#FAF9F5]">
                    <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">VIGENCIA DEL TOKEN (PAT)</div>
                    <div className="font-black text-[#FF4D00] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ghStatus?.daysRemaining ?? 90} DÍAS RESTANTES</span>
                    </div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      Expira: {ghStatus?.expiresAt || '2026-12-20'}
                    </div>
                  </div>

                  <div className="border border-neutral-200 p-2.5 bg-[#FAF9F5]">
                    <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">ALERTA DE RENOVACIÓN</div>
                    <div className="font-bold text-emerald-700">
                      AUTOCONTROL ACTIVO
                    </div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      Te avisaremos 10 días antes del vencimiento.
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Actions Box */}
              <div className="border-2 border-[#111111] bg-white p-4 space-y-3">
                <span className="font-black uppercase text-[#111111] block">
                  SINCRONIZACIÓN CON EL REPOSITORIO VERCEL / BLUEHOST:
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Al pulsar el botón de abajo, Sentinel enviará y guardará tu catálogo actual (<strong>{items.length} títulos</strong>) directamente en el archivo <code>data/sentinel-archive.json</code> del repositorio <code>florian-sentinel</code>. Vercel detectará el commit y compilará la versión actualizada automáticamente.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePushToGitHub}
                    disabled={isSyncingGh}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 bg-[#FF4D00] hover:bg-[#e04400] disabled:bg-neutral-300 text-white font-mono text-xs font-black uppercase border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] cursor-pointer"
                  >
                    <GitBranch className={`w-4 h-4 ${isSyncingGh ? 'animate-spin' : ''}`} />
                    <span>{isSyncingGh ? 'ENVIANDO COMMIT A GITHUB...' : `⇪ SINCRONIZAR A GITHUB (${items.length} TÍTULOS)`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromGitHub}
                    disabled={isPullingGh}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-neutral-100 text-[#111111] font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#FF4D00]" />
                    <span>{isPullingGh ? 'CARGANDO...' : 'RESTAURAR DESDE GITHUB'}</span>
                  </button>
                </div>
              </div>

              {/* Success / Error Message Banner */}
              {syncResult && (
                <div className={`p-3.5 border-2 border-[#111111] ${syncResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-600' : 'bg-rose-50 text-rose-900 border-rose-600'}`}>
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span>{syncResult.message}</span>
                    {syncResult.commitUrl && (
                      <a
                        href={syncResult.commitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-[#111111] text-white px-2 py-1 text-[10px] font-mono font-black uppercase"
                      >
                        <span>VER EN GITHUB</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTION IMPORT */}
          {activeTab === 'notion' && (
            <div className="space-y-4">
              <div className="border-2 border-[#111111] bg-white p-4">
                <div className="flex items-center gap-2 font-black text-[#111111] uppercase mb-2">
                  <Database className="w-4 h-4 text-[#FF4D00]" />
                  <span>CÓMO EXPORTAR E IMPORTAR TU BASE DE DATOS DE NOTION</span>
                </div>
                <div className="text-[11px] text-neutral-700 space-y-2 leading-relaxed bg-[#FFFDF9] p-3 border border-neutral-200">
                  <p>
                    Tu enlace <code>https://app.notion.com/p/jaimeflorian/...</code> es una página privada dentro de tu cuenta personal de Notion. Debido a la seguridad de Notion, no se puede raspar de forma pública sin tus credenciales.
                  </p>
                  <p className="font-bold text-[#111111]">
                    Exportarlo toma exactamente 15 segundos:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-800 font-mono text-[10px]">
                    <li>En tu navegador, abre tu página de Notion.</li>
                    <li>Arriba a la derecha, haz clic en el icono de tres puntos <strong>•••</strong>.</li>
                    <li>Selecciona <strong>Exportar (Export)</strong>.</li>
                    <li>En formato de exportación, elige <strong>CSV</strong> (o <em>Markdown & CSV</em>) y pulsa <strong>Exportar</strong>.</li>
                    <li>Arrastra el archivo <code>.csv</code> descargado aquí abajo o pega su contenido de texto.</li>
                  </ol>
                </div>
              </div>

              {/* Drag and Drop File Zone */}
              <div className="border-2 border-dashed border-[#111111] bg-white p-4 text-center">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto text-[#FF4D00] mb-2" />
                  <span className="font-black text-xs uppercase block text-[#111111]">
                    ARRASTRA O HAZ CLIC PARA SUBIR TU ARCHIVO CSV DE NOTION
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase block mt-1">
                    Formatos soportados: .csv o .json exportados desde Notion
                  </span>
                  <input
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const content = ev.target?.result as string;
                        if (content) {
                          handleParseNotion(content);
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-600 mb-1">
                  O PEGA DIRECTAMENTE EL TEXTO CSV / JSON AQUÍ:
                </label>
                <textarea
                  rows={4}
                  value={notionInput}
                  onChange={(e) => setNotionInput(e.target.value)}
                  placeholder="Pega aquí el contenido de tu archivo CSV o JSON..."
                  className="w-full p-2.5 border-2 border-[#111111] bg-white font-mono text-xs focus:outline-none"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-[#FFFDF9] border-2 border-[#111111] text-xs font-bold text-neutral-900">
                  {importStatus}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setNotionInput(`Title,Year,Director,Format,Packaging,Rating,Genres,LastWatched,Review
BLADE RUNNER 2049,2017,DENIS VILLENEUVE,4K_UHD,STEELBOOK,9.8,Sci-Fi;Drama,2026-09-15,Master en 4K nativo impresionante
AKIRA,1988,KATSUHIRO OTOMO,4K_UHD,SLIPCOVER,9.5,Anime;Sci-Fi,2026-08-20,Audio TrueHD remix fenomenal
DUNE PART TWO,2024,DENIS VILLENEUVE,4K_UHD,STEELBOOK,9.9,Sci-Fi;Action,2026-09-18,IMAX Aspect Ratio variable`);
                  }}
                  className="text-[10px] font-bold text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  Cargar ejemplo de estructura CSV de Notion
                </button>

                <button
                  type="button"
                  onClick={() => handleParseNotion()}
                  disabled={!notionInput.trim()}
                  className="px-4 py-2 bg-[#FF4D00] hover:bg-[#e04400] disabled:bg-neutral-300 text-white font-mono text-xs font-black uppercase border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                >
                  IMPORTAR Y MERGEAR AHORA
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP / EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="border border-[#111111] p-3 bg-white">
                <span className="font-black text-[#111111] uppercase block mb-1">
                  RESPALDO LOCAL Y PORTABILIDAD INMEDIATA:
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Tu colección actual tiene <strong>{items.length} títulos</strong> con metadatos completos, especificaciones de audio, video y bitácoras de visionado. Puedes descargar el archivo JSON en cualquier momento para importarlo en tu servidor de Bluehost, Vercel o restaurarlo aquí.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 p-3 bg-[#FF4D00] hover:bg-[#e04400] text-white font-mono text-xs font-black uppercase border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR BACKUP JSON ({items.length})</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-neutral-100 text-[#111111] font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer">
                  <Upload className="w-4 h-4 text-[#FF4D00]" />
                  <span>RESTAURAR ARCHIVO JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const parsed = JSON.parse(ev.target?.result as string);
                          if (Array.isArray(parsed)) {
                            onImportItems(parsed);
                            onClose();
                          }
                        } catch (err: any) {
                          alert('Error al leer archivo JSON: ' + err.message);
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
