import { NextRequest, NextResponse } from 'next/server';
import { setMeta } from '@/lib/printMetaStore';
import puppeteer from 'puppeteer';

// This endpoint accepts invoice metadata, generates a URL to a printable HTML version of the invoice,
// and uses a headless browser (Puppeteer) to render a high-fidelity PDF.

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);
    if (!payload) return NextResponse.json({ success: false, error: 'No payload' }, { status: 400 });

    // Store meta temporarily so the invoice template page can access it.
    // This avoids passing a huge JSON object in the URL.
    const token = `meta-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    setMeta(token, payload, 5 * 60 * 1000);

    // Construct the URL to the printable invoice page.
    // This needs to be an absolute URL for Puppeteer to navigate to it.
    // The page at '/invoice/printable' would be responsible for fetching the meta using the token and rendering the HTML.
    // A more robust way to get the base URL, especially in production environments
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.get('host')}`;
    const printableUrl = new URL('/invoice/printable', baseUrl);
    printableUrl.searchParams.set('token', token);

    const startTs = Date.now();
    let pdfBuffer: Buffer;
    let browser;

    try {
      console.log(`from-meta: launching browser to render ${printableUrl.toString()}`);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Important for running in containerized/serverless environments
      });
      const page = await browser.newPage();
      
      // Navigate to the page and wait until network activity has settled
      // Increased timeout to handle slower page loads in serverless environments
      await page.goto(printableUrl.toString(), { waitUntil: 'networkidle0', timeout: 15000 });

      // Generate the PDF
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, // Crucial for including CSS background colors/images
      });

    } catch (err) {
      console.error('from-meta: PDF render failed with Puppeteer', err);
      return NextResponse.json({ success: false, error: 'PDF generation failed' }, { status: 500 });
    } finally {
      if (browser) await browser.close();
    }

    console.log('from-meta: PDF generated in', Date.now() - startTs, 'ms; size', pdfBuffer.byteLength);
    const uint8 = new Uint8Array(pdfBuffer);
    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice.pdf"`,
        'Content-Length': String(uint8.byteLength),
        'Content-Transfer-Encoding': 'binary',
      }
    });
  } catch (err) {
    console.error('from-meta PDF failed', err);
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
