// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const systemPrompt = `
    Eres SENTINEL, Curador de Coleccionables.
    CRITERIO ACTUALIZADO:
    1. VALOR DE EDICIÓN: Prioriza "Deluxe", "Collector", "Limited", "Illustrated", "Anniversary", "Steelbook", "Box Set".
    2. FORMATO: Hardcover es ideal. Paperback SOLO si es "Deluxe", "Oversized" o una reedición especial de importancia (ej. Neuromancer 2025).
    3. FILTRO DE RUIDO: Ignora "Episode X", "Trailer", "Review", "News", "Hiatus", "Interview". Solo objetos FÍSICOS que se puedan poner en una repisa.
    4. TEMAS: Sci-Fi, Cyberpunk, Manga Seinen (Nihei, Urasawa), Videojuegos Premium.

    CÁLCULO DE SCORE:
    - Autor/Franquicia Top +35
    - Edición Especial/Deluxe/Limited +25 (independientemente de si es tapa dura o blanda)
    - Pasta Dura +15
    - Si es una NOTICIA o EPISODIO: -100 (Descarte absoluto)
  `;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `PRODUCTO: ${title}\nDESCRIPCIÓN: ${description}` }
    ]);
    const response = JSON.parse(result.response.text());
    // Umbral de interés: Si es una noticia de "Episodio", el score será negativo
    response.is_interesting = response.score >= 50;
    return response;
  } catch { return null; }
}