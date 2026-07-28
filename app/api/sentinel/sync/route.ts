// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({ headers: { 'User-Agent': 'Mozilla/5.0 Sentinel_Custom_Scanner_v4' } });

const RSS_FEEDS = [
  { name: "Blu-ray_4K", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Parka_Artbooks", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Anime_Manga_News", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "Game_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    // 1. LIMPIEZA SELECTIVA: Solo borramos los que no pasaron el filtro para limpiar el Inbox
    await prisma.discoveryInbox.deleteMany({
      where: {
        OR: [
          { status: "discarded" },
          { category_hint: "No Interesante" }
        ]
      }
    });

    let added = 0;
    let items_scanned = 0;

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      const latestItems = data.items.slice(0, 30); // Analizamos más para encontrar los "Deluxe"
      items_scanned += latestItems.length;

      for (const item of latestItems) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

        if (!existing) {
          const ai = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          
          // UMBRAL AJUSTADO A 60
          if (ai && ai.is_interesting && ai.score >= 60) {
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
          }
        }
      }
    }
    return NextResponse.json({ 
      status: "SUCCESS", 
      total_scanned: items_scanned, 
      new_assets_added: added 
    });
  } catch (error) {
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}