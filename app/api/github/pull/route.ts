import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'JaimeEstuardo/florian-sentinel';

  try {
    const path = 'data/sentinel-archive.json';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    const headers: Record<string, string> = {
      'User-Agent': 'Sentinel-Media-Hub',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const res = await fetch(apiUrl, { headers });
    if (!res.ok) {
      return NextResponse.json({ error: `Archivo no encontrado en GitHub (${res.status})` }, { status: res.status });
    }

    const fileInfo = await res.json();
    const content = Buffer.from(fileInfo.content, 'base64').toString('utf-8');
    const parsed = JSON.parse(content);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error pulling from GitHub' }, { status: 500 });
  }
}
