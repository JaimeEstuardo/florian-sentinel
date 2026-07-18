// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

const parser = new Parser();

// FUENTES ESTRATÉGICAS DE COLECCIONISMO
const RSS_FEEDS = [
  { name: "Blu-ray.com Releases", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "CheapAssGamer_VideoGames", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    console.log("SENTINEL_RADAR: Iniciando barrido de frecuencias...");
    const allResults = [];

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url);
      
      // Tomamos los últimos 5 ítems de cada fuente para no saturar la API de Gemini
      const latestItems = data.items.slice(0, 5);

      for (const item of latestItems) {
        const url = item.link || "";
        
        // 1. Evitar duplicados (Si ya existe en la DB, saltar)
        const existing = await prisma.discoveryInbox.findUnique({
          where: { raw_url: url }
        });

        if (!existing) {
          console.log(`SENTINEL_DETECTED: Nuevo activo encontrado: ${item.title}`);

          // 2. IA: Gemini analiza el hallazgo al vuelo
          const analysis = await classifyDiscovery(
            item.title || "", 
            item.contentSnippet || item.content || ""
          );

          // 3. Guardar solo si Gemini lo considera interesante (o dejarlo como pendiente)
          const newItem = await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Sin Título",
              raw_description: item.contentSnippet || "",
              raw_url: url,
              source_name: feed.name,
              status: analysis ? "classified" : "pending",
              category_hint: analysis?.category || "Unknown",
              gemini_analysis: analysis || {}
            }
          });
          
          allResults.push(newItem);
        }
      }
    }

    return NextResponse.json({ 
      status: "SUCCESS", 
      scan_count: allResults.length,
      new_items: allResults.map(i => i.raw_title)
    });

  } catch (error) {
    console.error("SENTINEL_SCAN_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "SCAN_FAILED" }, { status: 500 });
  }
}