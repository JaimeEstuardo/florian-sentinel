import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyDiscovery } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const item = await prisma.discoveryInbox.findUnique({ where: { id } });

    if (!item) return NextResponse.json({ error: "ITEM_NOT_FOUND" }, { status: 404 });

    const analysis = await classifyDiscovery(item.raw_title, item.raw_description || "");
    if (!analysis) return NextResponse.json({ error: "AI_FAILED" }, { status: 500 });

    const updated = await prisma.discoveryInbox.update({
      where: { id },
      data: {
        gemini_analysis: analysis,
        category_hint: analysis.category,
        status: "classified"
      }
    });

    return NextResponse.json(updated);
  } catch (_error) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}