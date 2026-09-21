import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'JaimeEstuardo/florian-sentinel';
  const expiresAt = process.env.GITHUB_TOKEN_EXPIRES || '2026-12-20';

  let daysRemaining = 90;
  try {
    const expiryDate = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
  } catch (e) {
    // fallback
  }

  if (!token) {
    return NextResponse.json({
      connected: false,
      error: 'GITHUB_TOKEN no configurado en variables de entorno',
      repo,
      expiresAt,
      daysRemaining,
    });
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Sentinel-Media-Hub',
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({
        connected: false,
        error: `Token inválido o expirado (HTTP ${userRes.status})`,
        repo,
        expiresAt,
        daysRemaining,
      });
    }

    const userData = await userRes.json();
    return NextResponse.json({
      connected: true,
      username: userData.login,
      avatarUrl: userData.avatar_url,
      repo,
      repoExists: true,
      repoDefaultBranch: 'main',
      expiresAt,
      daysRemaining,
      isExpiringSoon: daysRemaining <= 10,
      tokenPreview: `${token.substring(0, 7)}...${token.substring(token.length - 4)}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
      repo,
      expiresAt,
      daysRemaining,
    });
  }
}
