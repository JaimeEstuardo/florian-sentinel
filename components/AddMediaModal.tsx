"use client";
import React, { useState } from 'react';
import { MediaItem, MediaType, MediaFormat, PackagingType, WatchStatus } from '@/lib/types';
import { Search, Sparkles, Loader2, Save, X, Film, Image as ImageIcon } from 'lucide-react';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<MediaItem, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  editItem?: MediaItem | null;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(editItem ? editItem.title : '');
  const [originalTitle, setOriginalTitle] = useState(editItem?.originalTitle || '');
  const [type, setType] = useState<MediaType>(editItem?.type || 'movie');
  const [format, setFormat] = useState<MediaFormat>(editItem?.format || '4k_uhd');
  const [packaging, setPackaging] = useState<PackagingType>(editItem?.packaging || 'STEELBOOK');
  const [status, setStatus] = useState<WatchStatus>(editItem?.status || 'completed');
  const [year, setYear] = useState<number>(editItem?.year || new Date().getFullYear());
  const [director, setDirector] = useState(editItem?.director || '');
  const [studio, setStudio] = useState(editItem?.studio || '');
  const [genres, setGenres] = useState<string>(editItem?.genres.join(', ') || 'Sci-Fi, Cyberpunk');
  const [runtime, setRuntime] = useState(editItem?.runtime || '120 min');
  const [posterUrl, setPosterUrl] = useState(editItem?.posterUrl || '');
  const [synopsis, setSynopsis] = useState(editItem?.synopsis || '');
  const [location, setLocation] = useState(editItem?.location || 'Repisa Principal // A1');
  const [edition, setEdition] = useState(editItem?.edition || '4K Ultra HD Steelbook');
  const [audioSpecs, setAudioSpecs] = useState(editItem?.audioSpecs || 'Dolby Atmos 7.1');
  const [videoSpecs, setVideoSpecs] = useState(editItem?.videoSpecs || '4K Native HDR10+ / Dolby Vision');
  const [imdbRating, setImdbRating] = useState<number>(editItem?.ratings.imdb || 8.0);
  const [rottenRating, setRottenRating] = useState<number>(editItem?.ratings.rottenTomatoes || 85);
  const [metaRating, setMetaRating] = useState<number>(editItem?.ratings.metacritic || 80);
  const [personalRating, setPersonalRating] = useState<number>(editItem?.ratings.personal || 9.0);
  const [watchCount, setWatchCount] = useState<number>(editItem?.watchCount || 1);
  const [userReview, setUserReview] = useState(editItem?.userReview || '');
  const [isFavorite, setIsFavorite] = useState(editItem?.isFavorite || false);

  if (!isOpen) return null;

  const handleAutoEnrich = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/media/search-and-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, type })
      });

      const data = await response.json();
      if (data.success && data.data) {
        const d = data.data;
        setTitle(d.title || searchQuery.toUpperCase());
        if (d.originalTitle) setOriginalTitle(d.originalTitle);
        if (d.type) setType(d.type);
        if (d.year) setYear(d.year);
        if (d.director) setDirector(d.director);
        if (d.studio) setStudio(d.studio);
        if (d.genres && Array.isArray(d.genres)) setGenres(d.genres.join(', '));
        if (d.runtime) setRuntime(d.runtime);
        if (d.posterUrl) setPosterUrl(d.posterUrl);
        if (d.synopsis) setSynopsis(d.synopsis);
        if (d.ratings) {
          if (d.ratings.imdb) setImdbRating(d.ratings.imdb);
          if (d.ratings.rottenTomatoes) setRottenRating(d.ratings.rottenTomatoes);
          if (d.ratings.metacritic) setMetaRating(d.ratings.metacritic);
        }
        if (d.suggestedPackaging) setPackaging(d.suggestedPackaging);
        if (d.suggestedFormat) setFormat(d.suggestedFormat);
        if (d.audioSpecs) setAudioSpecs(d.audioSpecs);
        if (d.videoSpecs) setVideoSpecs(d.videoSpecs);
      } else {
        setSearchError('No se encontraron datos automáticos, puedes llenarlos manualmente.');
      }
    } catch (err: any) {
      setSearchError('Error de red al consultar metadatos.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Approximate runtime in minutes
    const runtimeMatch = runtime.match(/(\d+)/);
    const runtimeMinutes = runtimeMatch ? parseInt(runtimeMatch[1], 10) : 110;
    const decade = `${Math.floor(year / 10) * 10}s`;

    onSave({
      title: title.trim().toUpperCase(),
      originalTitle: originalTitle.trim(),
      type,
      format,
      packaging,
      status,
      year: Number(year),
      decade,
      director: director.trim().toUpperCase() || 'DIRECTOR UNKNOWN',
      studio: studio.trim().toUpperCase(),
      genres: genres.split(',').map(g => g.trim()).filter(Boolean),
      runtime: runtime.trim(),
      runtimeMinutes,
      posterUrl: posterUrl.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      synopsis: synopsis.trim(),
      ratings: {
        imdb: Number(imdbRating),
        rottenTomatoes: Number(rottenRating),
        metacritic: Number(metaRating),
        personal: Number(personalRating),
      },
      lastWatched: status === 'completed' || status === 'rewatch' ? new Date().toISOString().split('T')[0] : undefined,
      watchCount: Number(watchCount),
      audioSpecs: audioSpecs.trim(),
      videoSpecs: videoSpecs.trim(),
      location: location.trim(),
      edition: edition.trim(),
      userReview: userReview.trim(),
      isFavorite,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl border-[2.5px] border-[#111111] bg-[#F5F4EE] shadow-[6px_6px_0px_0px_#111111] my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b-[2.5px] border-[#111111] bg-[#111111] text-white px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00]"></span>
            <span>{editItem ? 'EDITAR REGISTRO CINEMATOGRÁFICO' : 'NUEVA ENTRADA EN EL ARCHIVO'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-mono text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Auto Search Bar Banner */}
        <div className="p-4 border-b border-[#111111]/20 bg-white">
          <label className="block font-mono text-[10px] font-black uppercase text-neutral-500 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D00]" />
            <span>BÚSQUEDA AUTOMÁTICA EN METABASES (IMDb, TMDB, ROTTEN, CRITERION):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAutoEnrich())}
              placeholder="Escribe el nombre: ej. Oppenheimer, Akira, Dune 2, Severance, Blade Runner..."
              className="flex-1 px-3 py-2 border-2 border-[#111111] bg-[#FAF9F5] font-mono text-xs font-bold text-[#111111] focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAutoEnrich}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF4D00] hover:bg-[#e04400] disabled:bg-neutral-300 text-white font-mono text-xs font-black uppercase border-2 border-[#111111] cursor-pointer transition-colors shrink-0"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isSearching ? 'INDEXANDO...' : 'AUTOCOMPLETAR'}</span>
            </button>
          </div>
          {searchError && (
            <p className="font-mono text-[10px] text-amber-700 mt-1">{searchError}</p>
          )}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono">
          {/* Row 1: Title, Original, Type */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                TÍTULO OFICIAL *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="BLADE RUNNER 2049"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-black uppercase text-[#111111] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                TÍTULO ORIGINAL
              </label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                placeholder="Blade Runner 2049 / アキラ"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs text-[#111111] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                TIPO
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                className="w-full px-2 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold uppercase focus:outline-none"
              >
                <option value="movie">PELÍCULA</option>
                <option value="series">SERIE</option>
                <option value="anime">ANIME</option>
              </select>
            </div>
          </div>

          {/* Row 2: Format, Packaging, Status, Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                FORMATO FÍSICO / DIG.
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as MediaFormat)}
                className="w-full px-2 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold uppercase focus:outline-none"
              >
                <option value="4k_uhd">4K ULTRA HD</option>
                <option value="steelbook">STEELBOOK</option>
                <option value="bluray">BLU-RAY STANDARD</option>
                <option value="criterion">CRITERION COLLECTION</option>
                <option value="boxset">COLLECTOR BOXSET</option>
                <option value="dvd">DVD</option>
                <option value="digital_4k">DIGITAL 4K / REMUX</option>
                <option value="streaming">STREAMING VOD</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                TIPO DE EMPAQUE
              </label>
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value as PackagingType)}
                className="w-full px-2 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold uppercase focus:outline-none"
              >
                <option value="STEELBOOK">STEELBOOK METÁLICO</option>
                <option value="SLIPCOVER">SLIPCOVER O-CARD</option>
                <option value="STANDARD">JEWEL / STANDARD</option>
                <option value="DIGIPAK">DIGIPAK CARTÓN</option>
                <option value="CRITERION">CRITERION CASE</option>
                <option value="BOXSET">BOXSET EDICIÓN ESPECIAL</option>
                <option value="DIGITAL">ARCHIVO DIGITAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                ESTADO DE VISIÓN
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WatchStatus)}
                className="w-full px-2 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold uppercase focus:outline-none"
              >
                <option value="completed">COMPLETADO / VISTO</option>
                <option value="in_progress">VIENDO / EN CURSO</option>
                <option value="backlog">POR VER / BACKLOG</option>
                <option value="rewatch">EN ROTACIÓN / RE-WATCH</option>
                <option value="abandoned">DESCARTADO</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                AÑO DE ESTRENO
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Director, Studio, Genres, Runtime */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                DIRECTOR / CREADOR
              </label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="DENIS VILLENEUVE"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs uppercase font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                ESTUDIO / DISCOS
              </label>
              <input
                type="text"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                placeholder="WARNER / TOHO / A24"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs uppercase font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                GÉNEROS (SEPARAR CON COMA)
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Sci-Fi, Cyberpunk, Acción"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                DURACIÓN
              </label>
              <input
                type="text"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                placeholder="164 min / 26 eps"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Ratings (IMDb, Rotten, Metacritic, Personal) */}
          <div className="border border-[#111111] p-3 bg-[#FFFDF9]">
            <span className="block text-[10px] font-black uppercase text-[#111111] mb-2">
              PUNTUACIONES CRÍTICAS & CALIFICACIÓN PERSONAL:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-600 mb-0.5">
                  IMDb (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={imdbRating}
                  onChange={(e) => setImdbRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-[#111111] bg-white text-xs font-bold text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-600 mb-0.5">
                  ROTTEN TOMATOES %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rottenRating}
                  onChange={(e) => setRottenRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-[#111111] bg-white text-xs font-bold text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-600 mb-0.5">
                  METACRITIC (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={metaRating}
                  onChange={(e) => setMetaRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-[#111111] bg-white text-xs font-bold text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-[#FF4D00] mb-0.5">
                  ★ NOTA FLORIAN (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={personalRating}
                  onChange={(e) => setPersonalRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border-2 border-[#FF4D00] bg-white text-xs font-black text-[#FF4D00]"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Audio, Video specs, Location & Edition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                AUDIO MASTERING
              </label>
              <input
                type="text"
                value={audioSpecs}
                onChange={(e) => setAudioSpecs(e.target.value)}
                placeholder="Dolby Atmos 7.1.4 / DTS-HD Master Audio"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                VIDEO TRANSFER / ASPECT RATIO
              </label>
              <input
                type="text"
                value={videoSpecs}
                onChange={(e) => setVideoSpecs(e.target.value)}
                placeholder="4K Native Dolby Vision / IMAX 1.90:1"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                UBICACIÓN FÍSICA O DIGITAL
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Repisa Principal A1 / NAS Remux"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                EDICIÓN FÍSICA
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="Limited Steelbook Glow in Dark"
                className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-bold text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Poster URL & Synopsis */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
              URL DE LA CARÁTULA / POSTER
            </label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://image.tmdb.org/... o URL directa de poster"
              className="w-full px-3 py-1.5 border-2 border-[#111111] bg-white text-xs font-mono text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
              SINOPSIS / FICHA DESCRIPTIVA
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Sinopsis detallada del título..."
              className="w-full p-2.5 border-2 border-[#111111] bg-white text-xs font-mono text-[#111111] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Row 7: Bitácora / Comentario Personal de Jaime */}
          <div>
            <label className="block text-[10px] font-black uppercase text-[#FF4D00] mb-1">
              BITÁCORA PERSONAL // COMENTARIO DE AUDITORÍA
            </label>
            <textarea
              rows={2}
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Notas personales: calidad del transfer, transfer sonoro, impresiones o estado de la copia..."
              className="w-full p-2.5 border-2 border-[#FF4D00] bg-white text-xs font-mono text-[#111111] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-[#111111] mt-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 accent-[#FF4D00] cursor-pointer"
                />
                <span>MARCAR COMO FAVORITO</span>
              </label>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-[#111111] font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-mono text-xs font-black uppercase border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{editItem ? 'ACTUALIZAR REGISTRO' : 'GUARDAR EN ARCHIVO'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
