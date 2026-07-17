import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { key } = await request.json();
  if (key === process.env.ACCESS_CODE) {
    return NextResponse.json({ authorized: true });
  }
  return NextResponse.json({ authorized: false }, { status: 401 });
}