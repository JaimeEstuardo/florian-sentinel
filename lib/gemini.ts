// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  // Usamos el modelo flash por ser más rápido para clasificación
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Actúa como un experto en coleccionismo (Libros de Arte de Videojuegos, CDs de Rock/Metal, Blu-rays 4K Steelbook y Libros de Sci-Fi).
    Analiza el siguiente producto y clasifícalo.
    
    PRODUCTO: "${title}"
    DESCRIPCIÓN: "${description}"

    RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
    {
      "category": "Libro de Arte" | "CD" | "Blu-ray" | "Libro Sci-Fi" | "Desconocido",
      "confidence": 0-100,
      "tags": ["tag1", "tag2"],
      "extracted_title": "Título limpio del producto",
      "creator": "Autor, Banda o Director",
      "is_interesting": true | false
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Limpiamos el texto por si Gemini añade decoradores de markdown
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("GEMINI_ERROR:", error);
    return null;
  }
}