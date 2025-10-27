import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: any) {
  const { id } = params || {};
  const baseCandidates: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) baseCandidates.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
  if (process.env.PORT) baseCandidates.push(`http://127.0.0.1:${process.env.PORT}`);
  baseCandidates.push(`http://127.0.0.1:3000`);
  baseCandidates.push(`http://localhost:3000`);

  const results: any = { id, attempts: [] };

  for (const base of baseCandidates) {
    try {
      const url = new URL(`/print/invoice/${encodeURIComponent(String(id))}`, base).toString();
      const res = await fetch(url).catch(() => null);
      results.attempts.push({ base, ok: !!(res && res.ok), status: res ? res.status : null });
      if (res && res.ok) {
        const text = await res.text().catch(() => null);
        results.fetchedHtmlLength = text ? text.length : null;
        results.fetchedFrom = base;
        break;
      }
    } catch (e) {
      results.attempts.push({ base, ok: false, error: String(e) });
    }
  }

  // Check Puppeteer availability
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteer = require('puppeteer');
    results.puppeteer = { available: true, version: puppeteer?.version || null };
  } catch (e) {
    results.puppeteer = { available: false, error: String(e) };
  }

  return NextResponse.json({ success: true, data: results });
}
