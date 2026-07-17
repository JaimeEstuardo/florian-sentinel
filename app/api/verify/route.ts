// app/api/verify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = body.key;
    
    // Llave de respaldo directa (Hardcoded)
    const MASTER_KEY = "florian-sentinel-2025";
    const ENV_KEY = process.env.ACCESS_CODE;

    // Validación triple: contra variable de entorno o contra llave maestra
    if (key === ENV_KEY || key === MASTER_KEY) {
      return NextResponse.json({ authorized: true }, { status: 200 });
    }

    console.log("SENTINEL_AUTH_FAIL: Llave no reconocida");
    return NextResponse.json({ authorized: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}