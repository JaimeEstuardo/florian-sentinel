// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const systemPrompt = `
    IDENTIDAD: Eres SENTINEL, el filtro de seguridad de una colección privada de élite.
    TU MISIÓN: Bloquear el 100% del ruido editorial. Solo dejas pasar OBJETOS FÍSICOS PREMIUM.

    LISTA NEGRA (Rechazo absoluto / Score 0):
    - Noticias de producción, Casts, Staff, Actores.
    - Rankings, "Top 10", "Best of", "Winners", Contests.
    - Reviews, Críticas, Opiniones, Análisis.
    - Streaming (Crunchyroll, Netflix, Disney+), Episodios, Capítulos.
    - Trailers, Teasers, Rumores, Entrevistas.
    - Merchandising barato (Llaveros, Juguetes de plástico).

    LISTA BLANCA (Lo que buscamos):
    - Ediciones Deluxe, Collector's, Limited, Anniversary.
    - Formatos: Hardcover, Steelbook, Vinyl, Box Set, Slipcase, Omnibus.
    - Artbooks oficiales y Guías de coleccionista.

    ALGORITMO DE PUNTUACIÓN:
    - Si es una noticia, review o streaming: 0 (CERO).
    - Si es un objeto físico premium de autores/franquicias top: 85-100.
    - Si es un objeto físico premium de otros autores: 60-84.

    RESPONDE EXCLUSIVAMENTE EN JSON:
    {
      "score": number,
      "is_interesting": boolean (Solo true si score >= 65),
      "category": "Artbook" | "Manga Deluxe" | "Steelbook" | "Hardcover" | "Physical Game" | "CD/Vinyl",
      "regret_factor": "Explicación de por qué este objeto es una oportunidad única de inversión física",
      "clean_title": "Nombre limpio del objeto"
    }
  `;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `PRODUCTO: ${title}\nDESCRIPCIÓN: ${description}` }
    ]);
    const response = JSON.parse(result.response.text());
    return response;
  } catch (error) {
    console.error("AI_STALL:", error);
    return null;
  }
}