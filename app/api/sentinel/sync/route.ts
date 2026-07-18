// app/api/sentinel/sync/route.ts
// UNIQUE_ID: FORCE_SYNC_V4_FINAL_CALIBRATION
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const parser = new Parser();

const RSS_FEEDS = [
  { name: "Blu-ray_Releases", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "CheapAssGamer_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    const allResults = [];
    console.log("SENTINEL_RADAR: Iniciando barrido...");

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      const latestItems = data.items.slice(0, 5);

      for (const item of latestItems) {
        const url = item.link || "";
        if (!url) continue;

        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

        if (!existing) {
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");
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

    return NextResponse.json({ 
      status: "RADAR_ONLINE_V4", 
      new_items_found: allResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ status: "ERROR", msg: "Fallo" }, { status: 500 });
  }
}