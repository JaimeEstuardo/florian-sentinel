// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser();

export async function GET() {
  try {
    const RSS_FEEDS = [
      { name: "Blu-ray_Latest", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
      { name: "Games_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
    ];

    const allResults = [];

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      for (const item of data.items.slice(0, 3)) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });
        if (!existing) {
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Untitled",
              raw_description: item.contentSnippet || "",
              raw_url: url,
              source_name: feed.name,
              status: analysis ? "classified" : "pending",
              category_hint: analysis?.category || "Unknown",
              gemini_analysis: analysis || {}
            }
          });
          allResults.push(item.title);
        }
      }
    }

    return NextResponse.json({ 
      status: "SENTINEL_RADAR_V7_ONLINE", 
      new_items: allResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("SYNC_ERROR:", error);
    return NextResponse.json({ status: "ERROR_V7", details: "Check Database/Gemini Key" }, { status: 500 });
  }
}