import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'JaimeEstuardo/florian-sentinel';

  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, message } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const path = 'data/sentinel-archive.json';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    let currentSha: string | undefined;
    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Sentinel-Media-Hub',
        },
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        currentSha = fileInfo.sha;
      }
    } catch (e) {
      // file might not exist yet
    }

    const filePayload = {
      version: '1.0.0',
      lastSyncedAt: new Date().toISOString(),
      curator: 'Jaime Florian',
      system: 'SENTINEL_NASA_PUNK',
      totalCount: items.length,
      items,
    };

    const contentBase64 = Buffer.from(JSON.stringify(filePayload, null, 2)).toString('base64');
    const commitMessage = message || `SENTINEL ARCHIVE: Sincronización de catálogo (${items.length} títulos) - ${new Date().toISOString().split('T')[0]}`;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Sentinel-Media-Hub',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: contentBase64,
        sha: currentSha,
        branch: 'main',
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return NextResponse.json({ error: `GitHub API error: ${errText}` }, { status: putRes.status });
    }

    const putData = await putRes.json();
    return NextResponse.json({
      success: true,
      commitSha: putData.commit?.sha,
      commitUrl: putData.commit?.html_url,
      path,
      count: items.length,
      syncedAt: filePayload.lastSyncedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error syncing to GitHub' }, { status: 500 });
  }
}
