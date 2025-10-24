import { NextRequest, NextResponse } from 'next/server';
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { connectDB } from '@/lib/db';
import { NewSale } from '@/models/NewSale';
import { renderInvoicePdfBuffer } from '@/lib/invoicePdf';

// This route prefers rendering the real invoice HTML (so the PDF matches the UI)
// by launching a headless browser (Puppeteer) and navigating to the printable invoice page.
// If Puppeteer isn't available or rendering fails, it falls back to the existing pdfkit renderer.

export async function GET(request: NextRequest, { params }: { params: { id: string } } | any) {
  const resolvedParams = (params && typeof (params as any).then === 'function') ? await params : params;
  const { id } = resolvedParams || {};
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

  // Fetch invoice from DB early (used by fallback and for existence check)
  await connectDB();
  const sale = await NewSale.findById(String(id)).lean();
  if (!sale) return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });

    // Try to render the real invoice page using Puppeteer. This preserves the exact UI/CSS.
    // In local development the Puppeteer path can be slow or fail due to missing
    // Chromium. Prefer the pdfkit fallback during development unless explicitly
    // enabled via FORCE_HEADLESS=1 in environment.
    const enableHeadless = Boolean(process.env.FORCE_HEADLESS === '1' || process.env.NODE_ENV === 'production');

    if (enableHeadless) {
      try {
    // Import puppeteer lazily so environments without it won't crash at module load
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteer = require('puppeteer');

    // Try to obtain printable HTML on the server first to avoid host/port problems when Puppeteer
    // cannot navigate to the local HTTP server. Prefer NEXT_PUBLIC_APP_URL, otherwise try localhost/127.0.0.1
    const baseCandidates = [] as string[];
    if (process.env.NEXT_PUBLIC_APP_URL) baseCandidates.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
    const hostHeader = request.headers.get('host');
    if (hostHeader) baseCandidates.push(`http://${hostHeader}`);
    // try common local addresses
    baseCandidates.push(`http://127.0.0.1:${process.env.PORT || 3000}`);
    baseCandidates.push(`http://localhost:${process.env.PORT || 3000}`);

    let printableHtml: string | null = null;
    let printableUrlStr: string | null = null;
    for (const base of baseCandidates) {
      try {
        const url = new URL(`/print/invoice/${encodeURIComponent(String(id))}`, base).toString();
        // attempt to fetch HTML server-side (faster and avoids Puppeteer navigation issues)
        const fetched = await fetch(url, { method: 'GET' }).catch(() => null);
        if (fetched && fetched.ok) {
          const txt = await fetched.text().catch(() => null);
          if (txt) {
            printableHtml = txt;
            printableUrlStr = url;
            break;
          }
        }
      } catch (e) {
        // ignore and try next base
      }
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();

      if (printableHtml) {
        console.log('download-invoice:id: using server-fetched HTML for Puppeteer render');
        // set content instead of navigating to avoid host/port issues
        await page.setContent(printableHtml, { waitUntil: 'networkidle0' }).catch(() => null);
      } else {
        // fallback: try navigating directly using a best-effort base
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${request.headers.get('host')}`;
        const printableUrl = new URL(`/print/invoice/${encodeURIComponent(String(id))}`, baseUrl);
        console.log('download-invoice:id: navigating to', printableUrl.toString());
        await page.goto(printableUrl.toString(), { waitUntil: 'networkidle0', timeout: 30000 });
      }

      // Generate the PDF
      const pdfBuffer: Buffer = await page.pdf({ format: 'A4', printBackground: true });
      const uint8 = new Uint8Array(pdfBuffer);
      console.log('download-invoice:id: Puppeteer PDF generated; size', uint8.byteLength);
      return new Response(uint8, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
          'Content-Length': String(uint8.byteLength),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Transfer-Encoding': 'binary'
        }
      });
    } finally {
      try { await browser.close(); } catch (e) { /* ignore */ }
    }
    } catch (err) {
      console.warn('download-invoice:id: Puppeteer render failed, falling back to pdfkit renderer', String(err));
      // Fall through to pdfkit-based renderer below
    }
  } else {
    console.log('download-invoice:id: skipping Puppeteer in development; using pdfkit renderer for faster response');
  }

  // Fallback: use PDFKit renderer (existing behavior). This produces a simpler PDF layout.
  try {
    const saleAny: any = sale;
    const items = Array.isArray(saleAny.items) ? saleAny.items : [];
    const subtotalVal = items.reduce((s: number, it: any) => s + ((Number(it.qty || 0) * Number(it.price || it.rate || 0)) || 0), 0);
    (saleAny as any).subtotal = subtotalVal;

    const startTs = Date.now();
    const timeoutMs = 20000; // 20s
    const renderPromise = renderInvoicePdfBuffer(saleAny as any);
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await Promise.race([
        renderPromise,
        new Promise<Buffer>((_, reject) => setTimeout(() => reject(new Error('PDF render timeout')), timeoutMs))
      ]);
    } catch (err) {
      console.error('download-invoice:id pdfkit render failed or timed out for', String(id), err);
      return NextResponse.json({ success: false, error: 'PDF generation timed out or failed' }, { status: 504 });
    }

    const uint8 = new Uint8Array(pdfBuffer);
    console.log('download-invoice:id: pdfkit PDF generated in', Date.now() - startTs, 'ms; size', uint8.byteLength);
    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
        'Content-Length': String(uint8.byteLength),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Transfer-Encoding': 'binary'
      }
    });
  } catch (err) {
    console.error('PDF generation failed', err);
    return NextResponse.json({ success: false, error: 'PDF generation failed on server' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
