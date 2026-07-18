// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';

// Fuentes de ejemplo (Podemos añadir RSS de Amazon, Blu-ray.com, etc.)
const SOURCES = [
  { name: "Wario64_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }, // Ejemplo RSS
];

export async function GET() {
  try {
    console.log("SENTINEL_SYNC: Iniciando escaneo de fuentes...");

    // 1. Simulación de Scraper (En el futuro aquí pondremos la lógica de cada tienda)
    // Por ahora, vamos a crear un "hallazgo" de prueba automático para probar el flujo
    const mockDiscoveries = [
      {
        title: "Interstellar 10th Anniversary 4K Collector's Edition Steelbook",
        source: "Blu-ray.com",
        url: "https://www.blu-ray.com/movies/Interstellar-4K-Blu-ray/365120/",
        desc: "Limited edition collector box with 4K disc and exclusive art cards."
      }
    ];

    const results = [];

    for (const raw of mockDiscoveries) {
      // 2. Guardar en la base de datos si no existe
      const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: raw.url } });
      
      if (!existing) {
        // 3. IA: Clasificación automática al vuelo
        const analysis = await classifyDiscovery(raw.title, raw.desc);

        const newItem = await prisma.discoveryInbox.create({
          data: {
            raw_title: raw.title,
            raw_description: raw.desc,
            raw_url: raw.url,
            source_name: raw.source,
            status: analysis ? "classified" : "pending",
            category_hint: analysis?.category || "Unknown",
            gemini_analysis: analysis || {}
          }
        });
        results.push(newItem);
      }
    }

    return NextResponse.json({ 
      status: "SYNC_COMPLETED", 
      new_items: results.length,
      items: results 
    });

  } catch (error) {
    return NextResponse.json({ error: "SYNC_FAILED" }, { status: 500 });
  }
}