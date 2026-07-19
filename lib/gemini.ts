// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function classifyDiscovery(title: string, description: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Actúa como un experto en adquisiciones de coleccionables de lujo. 
    Analiza este producto y clasifícalo en una de estas categorías:
    - "Artbook (Hardcover)"
    - "Video Game Guide (Collector)"
    - "Manga/Comic (Deluxe/Absolute)"
    - "4K Steelbook / Blu-ray"
    - "Rock/Metal CD (Special Ed.)"
    - "Video Game (Physical Ed.)"
    - "No Interesante"

    PRODUCTO: "${title}"
    DESCRIPCIÓN: "${description}"

    REQUISITO: Si el título menciona "Deluxe", "Absolute Edition", "Hardcover", "Art of", "Steelbook" o "Limited", dale alta prioridad.
    RESPONDE EXCLUSIVAMENTE EN JSON:
    {
      "category": "Nombre de la categoría",
      "confidence": 0-100,
      "extracted_title": "Título limpio para catálogo",
      "is_interesting": true/false
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch { return null; }
}