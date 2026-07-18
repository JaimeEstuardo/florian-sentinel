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
      // Tomamos solo los 3 primeros para una prueba rápida y segura
      for (const item of data.items.slice(0, 3)) {
        const url = item.link || "";
        
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });
        
        if (!existing) {
          const analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          
          const newItem = await prisma.discoveryInbox.create({
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
          allResults.push(newItem.raw_title);
        }
      }
    }

    return NextResponse.json({ 
      status: "SENTINEL_V7_ONLINE", 
      new_items: allResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("SYNC_ERROR:", error);
    return NextResponse.json({ status: "ERROR_V7", details: "Check Vercel Logs" }, { status: 500 });
  }
}