import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = body.key;
    
    // 1. Definimos las llaves autorizadas
    const HUB_MASTER_KEY = "dltwbydwtbibt8"; // Tu clave del Hub Central
    const SENTINEL_INTERNAL_KEY = "florian-sentinel-2025";
    const ENV_KEY = process.env.ACCESS_CODE;

    // 2. Validación de Handshake
    if (key === HUB_MASTER_KEY || key === SENTINEL_INTERNAL_KEY || key === ENV_KEY) {
      return NextResponse.json({ authorized: true }, { status: 200 });
    }

    // 3. Registro de intento fallido (para logs de seguridad)
    console.log("SENTINEL_SECURITY: Intento de acceso denegado con llave:", key);
    return NextResponse.json({ authorized: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}