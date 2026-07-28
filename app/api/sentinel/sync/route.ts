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
  { name: "Blu-ray_Latest", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Parka_Artbooks", url: "https://www.parkablogs.com/rss.xml" },
  { name: "VideoGame_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  const report = {
    status: "RADAR_REPORT",
    total_parsed: 0,
    added: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    for (const feed of RSS_FEEDS) {
      try {
        const data = await parser.parseURL(feed.url);
        const latest = data.items.slice(0, 10);
        report.total_parsed += latest.length;

        for (const item of latest) {
          const url = item.link || "";
          if (!url) continue;

          const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });
          if (existing) {
            report.skipped++;
            continue;
          }

          // IA: Análisis suave
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");

          await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Untitled",
              raw_description: item.contentSnippet || "",
              raw_url: url,
              source_name: feed.name,
              status: analysis ? "classified" : "pending",
              category_hint: analysis?.category || "Pendiente IA",
              gemini_analysis: analysis || {}
            }
          });
          report.added++;
        }
      } catch (e: any) {
        report.errors.push(`${feed.name}: ${e.message}`);
      }
    }
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ status: "CRITICAL_ERROR", message: error.message }, { status: 500 });
  }
}