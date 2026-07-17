import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    
    // Forzamos la lectura de la variable de entorno
    const serverKey = process.env.ACCESS_CODE;

    console.log("SENTINEL_AUTH: Recibida llave para validación");

    if (!serverKey) {
      console.error("ERROR: La variable ACCESS_CODE no está definida en Vercel");
      return NextResponse.json({ authorized: false, error: "ENV_NOT_SET" }, { status: 500 });
    }

    if (key === serverKey) {
      return NextResponse.json({ authorized: true });
    }

    return NextResponse.json({ authorized: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}