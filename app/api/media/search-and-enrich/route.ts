import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, type = 'movie' } = body;
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Act as an expert cinematic & anime archival database curator for a high-end NASA-punk collector archive.
Look up or provide precise metadata for the title: "${query}" (Type specified: ${type}).
Return a valid JSON object matching this schema:
{
  "title": "OFFICIAL TITLE IN UPPERCASE",
  "originalTitle": "Original language title (e.g. Japanese kanji / French title if applicable)",
  "type": "movie" | "series" | "anime",
  "year": 2024,
  "decade": "2020s",
  "director": "DIRECTOR OR CREATOR NAME",
  "studio": "Main production company or animation studio",
  "genres": ["Sci-Fi", "Cyberpunk"],
  "runtime": "145 min" or "2 Temporadas (18 eps)",
  "runtimeMinutes": 145,
  "posterUrl": "https://image.tmdb.org/... or clean public poster URL or Unsplash cinematography URL",
  "synopsis": "Rich, detailed synopsis in Spanish suitable for film buffs.",
  "ratings": {
    "imdb": 8.5,
    "rottenTomatoes": 92,
    "rottenTomatoesAudience": 89,
    "metacritic": 82,
    "personal": 9.0
  },
  "suggestedPackaging": "STEELBOOK" | "SLIPCOVER" | "STANDARD" | "CRITERION" | "BOXSET" | "DIGITAL",
  "suggestedFormat": "4k_uhd" | "steelbook" | "bluray" | "criterion" | "boxset" | "dvd" | "digital_4k" | "streaming",
  "audioSpecs": "Dolby Atmos / DTS-HD Master Audio specs",
  "videoSpecs": "4K Dolby Vision / HDR10+ / Aspect ratio"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          const parsed = JSON.parse(responseText);
          return NextResponse.json({ success: true, source: 'gemini-curator', data: parsed });
        }
      } catch (geminiError) {
        console.warn('Gemini auto-enrichment fallback:', geminiError);
      }
    }

    // Heuristic Fallback
    const cleanTitle = query.trim().toUpperCase();
    const currentYear = new Date().getFullYear();
    const isAnime = type === 'anime' || /anime|evangelion|akira|bebop|ghibli|shonen|mecha/i.test(query);
    const isSeries = type === 'series' || /season|temporada|series|hbo|netflix/i.test(query);
    const resolvedType = isAnime ? 'anime' : (isSeries ? 'series' : 'movie');

    return NextResponse.json({
      success: true,
      source: 'heuristic-local',
      data: {
        title: cleanTitle,
        originalTitle: cleanTitle,
        type: resolvedType,
        year: currentYear,
        decade: `${Math.floor(currentYear / 10) * 10}s`,
        director: 'DIRECTOR ARCHIVE',
        studio: isAnime ? 'STUDIO JAPAN' : 'STUDIO ARCHIVE',
        genres: isAnime ? ['Anime', 'Sci-Fi', 'Acción'] : ['Sci-Fi', 'Drama', 'Thriller'],
        runtime: resolvedType === 'series' ? '1 Temporada (10 eps)' : '120 min',
        runtimeMinutes: 120,
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
        synopsis: `Archivo catalogado para "${cleanTitle}". Registro de alta definición almacenado en la estación Sentinel 06 con metadatos técnicos completos.`,
        ratings: {
          imdb: 8.0,
          rottenTomatoes: 85,
          metacritic: 80,
          personal: 8.5
        },
        suggestedPackaging: 'STEELBOOK',
        suggestedFormat: '4k_uhd',
        audioSpecs: 'Dolby Atmos 7.1 / TrueHD',
        videoSpecs: '4K UHD HDR10+ / 2.39:1 Panavision'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing enrichment' }, { status: 500 });
  }
}
