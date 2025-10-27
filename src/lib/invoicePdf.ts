import PDFDocument from 'pdfkit';

// Simple PDF generation using PDFKit. Returns a Buffer with the generated PDF.
export async function renderInvoicePdfBuffer(invoiceData: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 36 });

  // Collect the PDF into a buffer using a PassThrough stream
  const stream = doc.pipe(new (require('stream').PassThrough)());

  const formatCurrency = (n: number) => {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n); } catch { return String(n); }
  };

  // Header
  doc.fontSize(14).text(invoiceData?.business?.name || 'Company', { align: 'left' });
  doc.moveDown(0.2);
  if (invoiceData?.business?.mobileNumber) doc.fontSize(10).text(`Mobile: ${invoiceData.business.mobileNumber}`, { align: 'left' });

  // Invoice meta on the right
  const invoiceNo = invoiceData?.invoiceNo || invoiceData?.invoiceNumber || '';
  doc.fontSize(10).text(`Invoice: ${invoiceNo}`, 400, 36, { align: 'right' });
  if (invoiceData?.invoiceDate) doc.text(`Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}`, { align: 'right' });

  doc.moveDown(1);

  // Bill To
  doc.fontSize(11).text('Bill To', { underline: true });
  doc.fontSize(10).text(invoiceData?.selectedParty?.name || invoiceData?.partyName || 'Customer');
  doc.moveDown(0.5);

  // Table header
  const tableTop = doc.y + 6;
  const col = {
    sNo: 36,
    items: 72,
    qty: 320,
    rate: 360,
    discount: 430,
    amount: 500,
  } as const;

  doc.fontSize(9).text('S.NO.', col.sNo, tableTop);
  doc.text('ITEMS', col.items, tableTop);
  doc.text('QTY', col.qty, tableTop, { width: 40, align: 'right' });
  doc.text('RATE', col.rate, tableTop, { width: 60, align: 'right' });
  doc.text('DISCOUNT', col.discount, tableTop, { width: 60, align: 'right' });
  doc.text('AMOUNT', col.amount, tableTop, { width: 80, align: 'right' });

  doc.moveTo(36, tableTop + 12).lineTo(559, tableTop + 12).strokeColor('#CCCCCC').stroke();

  // Items
  const items: any[] = Array.isArray(invoiceData?.items) ? invoiceData.items : [];
  let y = tableTop + 18;

  // Totals we will compute
  let subtotal = 0;
  let totalDiscount = 0;
  const taxTotals: { cgst?: number; sgst?: number; other?: number } = { cgst: 0, sgst: 0, other: 0 } as any;

  items.forEach((it: any, idx: number) => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || it.rate || 0);
    const lineAmount = qty * price;
    const discountAmt = Number(it.discountAmount ?? it.discount ?? 0);
    const netAmount = Math.max(0, lineAmount - (discountAmt || 0));

    subtotal += lineAmount;
    totalDiscount += (discountAmt || 0);

    // Tax fields: try to read cgstAmount/sgstAmount or taxAmount
    if (it.cgstAmount) taxTotals.cgst = (taxTotals.cgst || 0) + Number(it.cgstAmount);
    if (it.sgstAmount) taxTotals.sgst = (taxTotals.sgst || 0) + Number(it.sgstAmount);
    if (!it.cgstAmount && !it.sgstAmount && it.taxAmount) taxTotals.other = (taxTotals.other || 0) + Number(it.taxAmount);

    // Render row
    doc.fontSize(9).text(String(idx + 1), col.sNo, y);
    doc.text(it.name || '', col.items, y, { width: 240 });
    doc.text(String(qty || ''), col.qty, y, { width: 40, align: 'right' });
    doc.text(new Intl.NumberFormat('en-IN').format(price || 0), col.rate, y, { width: 60, align: 'right' });
    doc.text((discountAmt ? discountAmt.toLocaleString('en-IN') : ''), col.discount, y, { width: 60, align: 'right' });
    doc.text((netAmount || 0).toLocaleString('en-IN'), col.amount, y, { width: 80, align: 'right' });

    y += 18;
    if (y > 740) {
      doc.addPage();
      y = 36;
    }
  });

  doc.moveTo(36, y + 6).lineTo(559, y + 6).strokeColor('#CCCCCC').stroke();

  // Compute final totals
  const computedSubtotal = invoiceData?.subtotal ?? subtotal;
  const computedDiscount = invoiceData?.discountTotal ?? totalDiscount;
  const computedTaxTotal = invoiceData?.taxTotal ?? ((taxTotals.cgst || 0) + (taxTotals.sgst || 0) + (taxTotals.other || 0));
  const computedTotal = invoiceData?.totalAmount ?? (computedSubtotal - (computedDiscount || 0) + (computedTaxTotal || 0));

  // Totals block (right aligned)
  const totalsX = 380;
  let ty = y + 18;
  doc.fontSize(10).text(`Subtotal: ${formatCurrency(computedSubtotal)}`, totalsX, ty, { align: 'right' });
  ty += 16;
  if (computedDiscount && computedDiscount > 0) {
    doc.text(`Discount: -${formatCurrency(computedDiscount)}`, totalsX, ty, { align: 'right' });
    ty += 16;
  }

  // Tax breakdown: prefer CGST/SGST if present
  if ((taxTotals.cgst && taxTotals.cgst > 0) || (taxTotals.sgst && taxTotals.sgst > 0)) {
    if (taxTotals.cgst && taxTotals.cgst > 0) { doc.text(`CGST: ${formatCurrency(taxTotals.cgst)}`, totalsX, ty, { align: 'right' }); ty += 16; }
    if (taxTotals.sgst && taxTotals.sgst > 0) { doc.text(`SGST: ${formatCurrency(taxTotals.sgst)}`, totalsX, ty, { align: 'right' }); ty += 16; }
  } else if (taxTotals.other && taxTotals.other > 0) {
    doc.text(`Tax: ${formatCurrency(taxTotals.other)}`, totalsX, ty, { align: 'right' }); ty += 16;
  }

  // Grand total
  doc.fontSize(11).text(`Total: ${formatCurrency(computedTotal)}`, totalsX, ty + 4, { align: 'right' });

  doc.end();

  // Convert stream to buffer by collecting chunks
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
