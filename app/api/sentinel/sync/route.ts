import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser({ headers: { 'User-Agent': 'Mozilla/5.0 Sentinel_Curator_v2' } });

const RSS_FEEDS = [
  { name: "Blu-ray_Steelbooks", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
  { name: "Parka_Artbooks", url: "https://www.parkablogs.com/rss.xml" },
  { name: "Manga_News", url: "https://www.animenewsnetwork.com/all/rss.xml" },
  { name: "CheapAssGamer", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
];

export async function GET() {
  try {
    let added = 0;
    let filtered = 0;
    for (const feed of RSS_FEEDS) {
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      for (const item of data.items.slice(0, 10)) {
        const url = item.link || "";
        const existing = await prisma.discoveryInbox.findUnique({ where: { raw_url: url } });
        if (!existing) {
          const ai = await classifyDiscovery(item.title || "", item.contentSnippet || "");
          if (ai && ai.is_interesting && ai.score >= 50) {
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
          } else { filtered++; }
        }
      }
    }
    return NextResponse.json({ status: "CURATION_COMPLETE", new_assets: added, noise_filtered: filtered });
  } catch {
    return NextResponse.json({ status: "ERROR", message: "Fallo" }, { status: 500 });
  }
}