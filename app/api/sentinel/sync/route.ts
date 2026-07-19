// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 Sentinel_Radar_Bot_06' }
});

const RSS_FEEDS = [
  { name: "Blu-ray_4K_Steelbooks", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Artbooks_&_Guides", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Manga_&_Deluxe_Comics", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "Game_Deals_&_Collector_Eds", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    let newTotal = 0;
    const allItems = [];

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      
      // Tomamos los 15 más recientes de cada fuente para ampliar el barrido
      for (const item of data.items.slice(0, 15)) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

        if (!existing) {
          // Análisis automático con el nuevo criterio de categorías
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          
          // Solo guardamos si Gemini lo ve interesante para tu perfil
          if (analysis && analysis.is_interesting) {
            await prisma.discoveryInbox.create({
              data: {
                raw_title: analysis.extracted_title || item.title,
                raw_description: item.contentSnippet || "",
                raw_url: url,
                source_name: feed.name,
                status: "classified",
                category_hint: analysis.category,
                gemini_analysis: analysis
              }
            });
            newTotal++;
          }
        }
      }
    }

    return NextResponse.json({ status: "SCAN_COMPLETE", new_items: newTotal });
  } catch { return NextResponse.json({ status: "ERROR" }, { status: 500 }); }
}