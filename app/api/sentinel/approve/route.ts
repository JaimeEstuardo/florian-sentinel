import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    // 1. Obtener el descubrimiento
    const discovery = await prisma.discoveryInbox.findUnique({ where: { id } });
    if (!discovery) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // 2. Crear el item en el catálogo oficial
    const newItem = await prisma.catalogItem.create({
      data: {
        title: discovery.raw_title,
        category: discovery.category_hint || "Uncategorized",
        product_editions: {
          create: {
            edition_name: "Standard Edition", // Esto se puede editar después
            is_preorder: true,
          }
        }
      }
    });

    // 3. Eliminar o marcar como procesado el descubrimiento
    await prisma.discoveryInbox.delete({ where: { id } });

    return NextResponse.json(newItem);
  } catch {
    return NextResponse.json({ error: "APPROVE_FAILED" }, { status: 500 });
  }
}