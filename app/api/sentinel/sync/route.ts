// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

const parser = new Parser();

// FUENTES REALES DE ALTA FRECUENCIA
const RSS_FEEDS = [
  { name: "Blu-ray_Releases", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "CheapAssGamer_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    const allResults = [];
    console.log("SENTINEL_RADAR: Iniciando barrido...");

    for (const feed of RSS_FEEDS) {
      // Intentamos leer la fuente
      const data = await parser.parseURL(feed.url).catch(e => {
        console.error(`Error en fuente ${feed.name}:`, e);
        return { items: [] };
      });
      
      // Procesamos los 5 más recientes de cada uno
      const latestItems = data.items.slice(0, 5);

      for (const item of latestItems) {
        const url = item.link || "";
        if (!url) continue;

        // 1. Verificamos si ya lo conocemos
        const existing = await prisma.discoveryInbox.findUnique({
          where: { raw_url: url }
        });

        if (!existing) {
          // 2. IA: Gemini analiza el activo
          const analysis = await classifyDiscovery(
            item.title || "", 
            item.contentSnippet || item.content || ""
          );

          // 3. Registro en la base de datos
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
          allResults.push(newItem.raw_title);
        }
      }
    }

    // RESPUESTA ACTUALIZADA PARA CONFIRMAR VERSIÓN
    return NextResponse.json({ 
      status: "RADAR_OPERATIONAL", 
      new_items_found: allResults.length,
      titles: allResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("CRITICAL_SYNC_ERROR:", error);
    return NextResponse.json({ status: "ERROR", message: "Fallo en el barrido" }, { status: 500 });
  }
}