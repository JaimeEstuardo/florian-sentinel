// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const systemPrompt = `
    Eres SENTINEL, Curador de Coleccionables Premium.
    
    TU FILTRO:
    1. OBJETIVO: Detectar OBJETOS FÍSICOS (Libros de Arte, Steelbooks, Manga Deluxe, Box Sets).
    2. EXCEPCIÓN DE REVIEWS: Si el título dice "Review" o "Preview" pero el objeto es un ARTBOOK o una edición especial física, NO lo descartes. El usuario quiere saber que el objeto existe.
    3. DESCARTE ABSOLUTO: Noticias de casting, trailers de cine (sin anuncio de disco físico), rumores, streaming puro (solo digital) y episodios de anime.

    ALGORITMO DE PUNTUACIÓN (Collector Score):
    - +40: Coincide con autores/franquicias (Gibson, Nihei, Blade Runner, Gantz, etc.)
    - +30: Es formato Premium (Steelbook, Hardcover, Deluxe, Slipcase, Box Set).
    - +10: Es un Artbook o Guía de Coleccionista.
    - PENALIZACIÓN: -100 si es una noticia de "nuevo actor", "pausa de autor" o "capítulo online".

    RESPONDE EXCLUSIVAMENTE EN JSON:
    {
      "score": number (0-100),
      "is_interesting": boolean (true si score >= 60),
      "category": "Artbook" | "Manga Deluxe" | "Steelbook" | "Hardcover" | "Physical Game" | "CD/Vinyl",
      "regret_factor": "Explicación técnica de por qué este objeto es una pieza de colección valiosa a futuro",
      "clean_title": "Nombre del producto sin las palabras 'Review' o 'Preview'"
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