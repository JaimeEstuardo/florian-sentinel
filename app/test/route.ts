// app/test/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    status: "SENTINEL_PROBE_ACTIVE", 
    message: "El sistema de rutas está operativo",
    timestamp: new Date().toISOString()
  });
}