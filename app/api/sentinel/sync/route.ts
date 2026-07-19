// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
});

const RSS_FEEDS = [
  { name: "Blu-ray_Latest", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "CheapAssGamer", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    let newTotal = 0;
    const log = [];

    for (const feed of RSS_FEEDS) {
      console.log(`Buscando en: ${feed.name}`);
      const data = await parser.parseURL(feed.url).catch((e) => {
        console.error(`Error en ${feed.name}:`, e.message);
        return { items: [] };
      });

      // Tomamos los 10 más recientes
      for (const item of data.items.slice(0, 10)) {
        const url = item.link || "";
        if (!url) continue;

        const existing = await prisma.discoveryInbox.findUnique({
          where: { raw_url: url }
        });

        if (!existing) {
          await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Untitled",
              raw_description: item.contentSnippet || "",
              raw_url: url,
              source_name: feed.name,
              status: "pending",
              category_hint: "PENDIENTE_IA",
              gemini_analysis: {}
            }
          });
          newTotal++;
          log.push(item.title);
        }
      }
    }

    return NextResponse.json({ 
      status: "SCAN_COMPLETE", 
      new_items: newTotal,
      titles: log 
    });

  } catch (error: any) {
    return NextResponse.json({ status: "CRITICAL_ERROR", message: error.message }, { status: 500 });
  }
}