// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({ headers: { 'User-Agent': 'Mozilla/5.0 Sentinel_Elite_Scanner' } });

const RSS_FEEDS = [
  { name: "Blu-ray_Steelbooks", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Parka_Artbooks", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Manga_&_Comics_Deluxe", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "Deals_High_End", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    // 1. MANIOBRA DE PURGA: Borramos TODO el Inbox actual para eliminar basura acumulada
    await prisma.discoveryInbox.deleteMany({});
    console.log("PURGA_COMPLETA: Inbox reiniciado para escaneo de alta pureza.");

    let added = 0;
    let discarded = 0;

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      
      for (const item of data.items.slice(0, 25)) {
        const url = item.link || "";
        
        // Filtro rápido de palabras antes de gastar IA (Doble muro)
        const lowerTitle = (item.title || "").toLowerCase();
        const noiseWords = ["review", "streaming", "episode", "trailer", "winner", "ranking", "top 10", "best of"];
        if (noiseWords.some(word => lowerTitle.includes(noiseWords[noiseWords.indexOf(word)]))) {
          discarded++;
          continue;
        }

        const ai = await classifyDiscovery(item.title || "", item.contentSnippet || "");
        
        // REGLA DE ORO: Solo entra lo excelente (Score >= 70)
        if (ai && ai.is_interesting && ai.score >= 70) {
          await prisma.discoveryInbox.create({
            data: {
              raw_title: ai.clean_title || item.title,
              raw_description: ai.regret_factor,
              raw_url: url,
              source_name: feed.name,
              status: "classified",
              category_hint: ai.category,
              gemini_analysis: ai
            }
          });
          added++;
        } else {
          discarded++;
        }
      }
    }
    return NextResponse.json({ 
      status: "PURE_BARRIDO_COMPLETE", 
      assets_found: added, 
      noise_incinerated: discarded 
    });
  } catch (error) {
    return NextResponse.json({ status: "SCANNER_OFFLINE" }, { status: 500 });
  }
}