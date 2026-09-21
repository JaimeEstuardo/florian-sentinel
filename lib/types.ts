export type MediaType = 'movie' | 'series' | 'anime';

export type MediaFormat = 
  | '4k_uhd'
  | 'steelbook'
  | 'bluray'
  | 'criterion'
  | 'boxset'
  | 'dvd'
  | 'digital_4k'
  | 'streaming';

export type PackagingType = 
  | 'STEELBOOK'
  | 'SLIPCOVER'
  | 'STANDARD'
  | 'DIGIPAK'
  | 'CRITERION'
  | 'BOXSET'
  | 'DIGITAL';

export type WatchStatus = 
  | 'completed'    // Visto
  | 'in_progress'  // Viendo actualmente
  | 'backlog'      // Por ver
  | 'rewatch'      // En rotación de revisionado
  | 'abandoned';   // Abandonado

export interface RatingData {
  imdb: number;               // Escala 0.0 - 10.0 (ej. 8.8)
  rottenTomatoes: number;     // Escala 0 - 100% (ej. 94)
  rottenTomatoesAudience?: number; // Escala 0 - 100%
  metacritic: number;         // Escala 0 - 100 (ej. 85)
  personal: number;           // Escala 0.0 - 10.0 de Jaime (ej. 9.5)
}

export interface WatchHistoryEntry {
  id: string;
  date: string;               // YYYY-MM-DD
  note: string;
  rating?: number;
  formatWatched?: string;
}

export interface MediaItem {
  id: string;
  code: string;               // e.g. "SEN_042"
  title: string;
  originalTitle?: string;
  type: MediaType;
  format: MediaFormat;
  packaging: PackagingType;
  status: WatchStatus;
  year: number;
  decade: string;             // e.g. "1980s", "1990s", "2000s", "2010s", "2020s"
  director: string;           // o Creador / Showrunner
  studio?: string;            // Estudio / Distribuidora
  genres: string[];
  runtime: string;            // "164 min" o "2 temporadas"
  runtimeMinutes: number;     // Para telemetría de horas vistas
  posterUrl: string;
  backdropUrl?: string;
  synopsis: string;
  ratings: RatingData;
  lastWatched?: string;       // YYYY-MM-DD o ISO
  watchCount: number;         // Número de visualizaciones acumuladas
  audioSpecs?: string;        // "Dolby Atmos / TrueHD 7.1", "DTS-HD MA 5.1"
  videoSpecs?: string;        // "4K Dolby Vision / HDR10+", "1080p 24fps"
  location?: string;          // "Repisa Principal A1", "Servidor Local", etc.
  edition?: string;           // "Limited Collector's Edition", "Criterion #982", "The Final Cut"
  userReview?: string;        // Bitácora / Comentario técnico o personal de Jaime
  history: WatchHistoryEntry[];
  isFavorite: boolean;
  notionPageId?: string;
  githubCommitSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  type: 'ALL' | MediaType;
  format: 'ALL' | MediaFormat | 'PHYSICAL' | 'DIGITAL';
  packaging: 'ALL' | PackagingType;
  status: 'ALL' | WatchStatus | 'OLVIDADOS';
  genre: string;
  decade: string;
  sortBy: 'lastWatched' | 'watchCount' | 'title' | 'year' | 'personalRating' | 'imdb';
  sortOrder: 'asc' | 'desc';
}

export interface CollectionTelemetry {
  totalItems: number;
  moviesCount: number;
  seriesCount: number;
  animeCount: number;
  physicalCount: number;
  digitalCount: number;
  activeProcessing: number;
  completedCycles: number;
  backlogCount: number;
  totalHoursWatched: number;
  watchStreakDays: number;
  unwatchedForgottenCount: number;
  cadenceDays: { date: string; dayLabel: string; active: boolean; count: number }[];
  decadesBreakdown: { decade: string; count: number; percentage: number }[];
  packagingBreakdown: { packaging: PackagingType; count: number; percentage: number }[];
  topDirectors: { name: string; count: number }[];
  topRewatched: MediaItem[];
}
