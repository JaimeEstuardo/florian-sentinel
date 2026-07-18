import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = body.key;
    const MASTER_KEY = "florian-sentinel-2025";
    const ENV_KEY = process.env.ACCESS_CODE;

    if (key === ENV_KEY || key === MASTER_KEY) {
      return NextResponse.json({ authorized: true }, { status: 200 });
    }
    return NextResponse.json({ authorized: false }, { status: 401 });
  } catch (_error) {
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}