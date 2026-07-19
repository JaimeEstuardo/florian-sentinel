// app/api/sentinel/sync/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
const parser = new Parser();

export async function GET() {
  try {
    const RSS_FEEDS = [
      { name: "Blu-ray_Latest", url: "https://www.blu-ray.com/rss/newreleasesfeed.xml" },
      { name: "VideoGame_Deals", url: "https://www.cheapassgamer.com/forum/24-video-game-deals/index.rss" }
    ];

    let newTotal = 0;
    const detectedTitles: string[] = [];

    for (const feed of RSS_FEEDS) {
      // Intentamos obtener los datos del RSS
      const data = await parser.parseURL(feed.url).catch(() => ({ items: [] }));
      
      // Procesamos los 10 más recientes de cada fuente
      for (const item of data.items.slice(0, 10)) {
        const url = item.link || "";
        if (!url) continue;

        // Verificamos si ya existe en la base de datos
        const existing = await prisma.discoveryInbox.findUnique({
          where: { raw_url: url }
        });

        if (!existing) {
          await prisma.discoveryInbox.create({
            data: {
              raw_title: item.title || "Activo sin título",
              raw_description: item.contentSnippet || item.content || "",
              raw_url: url,
              source_name: feed.name,
              status: "pending",
              category_hint: "Pendiente de IA",
              gemini_analysis: {}
            }
          });
          newTotal++;
          detectedTitles.push(item.title || "Untitled");
        }
      }
    }

    return NextResponse.json({ 
      status: "SCAN_SUCCESSFUL", 
      count: newTotal,
      items: detectedTitles 
    });

  } catch (error) {
    console.error("SYNC_CRITICAL_ERROR");
    return NextResponse.json({ status: "SCAN_FAILED" }, { status: 500 });
  }
}