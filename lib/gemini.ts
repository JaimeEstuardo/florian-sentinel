// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  // Usamos el modelo flash por su velocidad de respuesta
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Eres un experto en coleccionismo de alto nivel (Libros de Arte, CDs Rock/Metal, Blu-rays Steelbook y Sci-Fi).
    Analiza este hallazgo y clasifícalo con precisión técnica.
    
    PRODUCTO: "${title}"
    DESCRIPCIÓN: "${description}"

    RESPONDE EXCLUSIVAMENTE EN FORMATO JSON PURO:
    {
      "category": "Libro de Arte" | "CD" | "Blu-ray" | "Libro Sci-Fi" | "Videojuego",
      "confidence": 0-100,
      "tags": ["tag1", "tag2"],
      "extracted_title": "Título limpio",
      "creator": "Autor/Banda/Director",
      "is_interesting": true
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Limpieza de posibles decoradores Markdown
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("GEMINI_CORE_ERROR:", error);
    return null;
  }
}