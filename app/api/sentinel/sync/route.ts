// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({ headers: { 'User-Agent': 'Mozilla/5.0 Sentinel_Curator_v3' } });

const RSS_FEEDS = [
  { name: "Blu-ray_4K", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Artbooks_Parka", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Manga_Deluxe", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "Games_&_Guides", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    // 1. PURGA: Eliminamos registros que no fueron clasificados o son muy viejos para limpiar el Dashboard
    await prisma.discoveryInbox.deleteMany({
      where: {
        OR: [
          { category_hint: "PENDIENTE_IA" },
          { category_hint: "No Interesante" },
          { raw_title: { contains: "Episode" } }
        ]
      }
    });

    let added = 0;
    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      
      // Ampliamos a 30 ítems para no perder nada importante
      for (const item of data.items.slice(0, 30)) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

        if (!existing) {
          const ai = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          
          if (ai && ai.is_interesting) {
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
    return NextResponse.json({ status: "OK", new_assets: added });
  } catch { return NextResponse.json({ status: "ERROR" }, { status: 500 }); }
}