// app/test/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: "SONDA_DE_VIDA_EXITOSA", 
    status: "SISTEMA_CONECTADO_CORRECTAMENTE",
    timestamp: new Date().toISOString()
  });
}