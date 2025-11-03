import React from 'react';
import { connectDB } from '@/lib/db';
import { NewSale } from '@/models/NewSale';
// printMetaStore was removed; attempt to require it dynamically to avoid hard crash.
let getPrintedMeta: ((token: string) => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // require at runtime in case the module is absent
  // @ts-ignore
  const mod = require('@/lib/printMetaStore');
  getPrintedMeta = mod?.getMeta ?? null;
} catch (e) {
  getPrintedMeta = null;
}
import InvoiceDownloadServer from '@/components/InvoiceDownloadServer';

type Props = { params: { id: string } | Promise<{ id: string }>, searchParams?: { [key: string]: string | undefined } | Promise<{ [key: string]: string | undefined }> };

export default async function PrintInvoicePage({ params, searchParams }: Props) {
  // Next.js may pass params/searchParams as promises in some runtimes — resolve them safely before use.
  const resolvedParams = (params && typeof (params as any).then === 'function') ? await params : params;
  const resolvedSearch = (searchParams && typeof (searchParams as any).then === 'function') ? await searchParams : searchParams;
  const _params = resolvedParams as { id: string } | undefined;
  const _search = resolvedSearch as { [key: string]: string | undefined } | undefined;
  const { id } = _params || {};

  // If a metaToken is provided (from /api/download-invoice/from-meta), prefer rendering from that meta
  const token = _search?.metaToken;
  let sale: any = null;
  let business: any = {};
  let party: any = {};
  let items: any[] = [];

  if (token && typeof getPrintedMeta === 'function') {
    const meta = getPrintedMeta(token);
    if (meta) {
      sale = meta;
      business = meta.business || {};
      party = meta.selectedParty || {};
      items = Array.isArray(meta.items) ? meta.items : [];
    }
  }

  if (!sale) {
    await connectDB();
    // Avoid using `.populate()` here to prevent runtime errors when related models (e.g. Party)
    // are not registered in this server context. Use the embedded fields on the sale document
    // when available and fall back to empty objects.
    const fromDb = await NewSale.findById(String(id)).lean();
    if (!fromDb) return <div>Invoice not found</div>;
    sale = fromDb;
    business = (sale as any).business || {};
    party = (sale as any).selectedParty || (sale as any).party || {};
    items = Array.isArray((sale as any).items) ? (sale as any).items : [];
  }

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const subtotalNoTax = items.reduce((acc: number, it: any) => acc + (Number(it.qty || 0) * Number(it.price || it.rate || 0)), 0);

  // small helper to convert amount to words (INR)
  const amountToWords = (amount: number) => {
    if (!isFinite(amount)) return '';
    const rupees = Math.floor(Math.abs(amount));
    const paise = Math.round((Math.abs(amount) - rupees) * 100);

    const ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const toWords = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
      if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
      return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
    };

    const words = toWords(rupees) || 'Zero';
    return (amount < 0 ? 'Minus ' : '') + words + ' Rupees' + (paise ? ' and ' + paise + ' Paise' : ' Only');
  };

  // Render the server-side invoice component which mirrors the client `InvoiceDownload` markup.
  // If autoPrint flag is present in query, inject a small script to trigger print on load.
  const shouldAutoPrint = _search?.autoPrint === '1';

  return (
    <>
      {shouldAutoPrint ? (
        // Inline script to call window.print() on client once the page loads
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){ try{ window.print(); setTimeout(function(){ try{ window.close(); }catch(e){} }, 1500); }catch(e){} })();
        ` }} />
      ) : null}
      <InvoiceDownloadServer invoiceType={(sale?.invoiceType || 'sale') as any} data={sale} />
    </>
  );
}
