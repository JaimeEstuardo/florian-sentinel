// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
  }
});

const RSS_FEEDS = [
  { name: "Blu-ray_4K", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Parka_Artbooks", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Anime_Manga_News", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "Game_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  let report = {
    status: "DIAGNOSTIC_MODE",
    feeds_checked: 0,
    total_items_parsed: 0,
    skipped_duplicates: 0,
    added_to_inbox: 0,
    errors: [] as string[]
  };

  try {
    for (const feed of RSS_FEEDS) {
      report.feeds_checked++;
      try {
        const data = await parser.parseURL(feed.url);
        const latestItems = data.items.slice(0, 15);
        report.total_items_parsed += latestItems.length;

        for (const item of latestItems) {
          const url = item.link || "";
          if (!url) continue;

          // 1. Verificar duplicados
          const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

          if (existing) {
            report.skipped_duplicates++;
            continue;
          }

          // 2. IA: Intentamos clasificar pero NO bloqueamos si la IA dice que no es interesante
          // En esta fase de rescate, queremos ver TODO.
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");

          await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Untitled",
              raw_description: item.contentSnippet || "",
              raw_url: url,
              source_name: feed.name,
              status: analysis ? "classified" : "pending",
              category_hint: analysis?.category || "Pendiente de IA",
              gemini_analysis: analysis || {}
            }
          });
          report.added_to_inbox++;
        }
      } catch (e: any) {
        report.errors.push(`Error en ${feed.name}: ${e.message}`);
      }
    }

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ status: "CRITICAL_ERROR", message: error.message }, { status: 500 });
  }
}