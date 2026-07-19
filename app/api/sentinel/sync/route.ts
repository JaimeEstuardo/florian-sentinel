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
      { name: "Games_RSS", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
    ];

    let newTotal = 0;

    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      
      for (const item of data.items.slice(0, 10)) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });

        if (!existing) {
          // Intentamos clasificar pero si falla lo guardamos igual como Pendiente
          let analysis = null;
          try {
            analysis = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          } catch (e) { console.error("GEMINI_STALL"); }

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
          newTotal++;
        }
      }
    }

    return NextResponse.json({ status: "OK", new_items: newTotal });
  } catch (error) {
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}