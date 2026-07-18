// app/test/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: "SONDA_DE_VIDA_EXITOSA", 
    timestamp: new Date().toISOString(),
    status: "PROYECTO_CONECTADO_CORRECTAMENTE"
  });
}