import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const discovery = await prisma.discoveryInbox.findUnique({ where: { id } });
    if (!discovery) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // Se crea en la lista de seguimiento (Wishlist)
    const newItem = await prisma.catalogItem.create({
      data: {
        title: discovery.raw_title,
        category: discovery.category_hint || "Uncategorized",
        status: "wishlist", // Por defecto entra aquí
        product_editions: {
          create: {
            edition_name: "Edición Detectada",
            is_preorder: true,
          }
        }
      }
    });

    await prisma.discoveryInbox.delete({ where: { id } });
    return NextResponse.json(newItem);
  } catch { return NextResponse.json({ error: "FAIL" }, { status: 500 }); }
}