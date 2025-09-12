import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Invoice } from '@/models/invoiceModel'; // Adjust the import path as necessary

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoice = await Invoice.findById(params.id).populate('party').lean();

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    const stream = new ReadableStream({
      start(controller) {
        doc.on('data', (chunk) => controller.enqueue(chunk));
        doc.on('end', () => controller.close());
        doc.on('error', (err) => controller.error(err));

        // Build PDF content here (same as previous PDF example)...
        doc.fontSize(20).text('Your Company Name', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNo}`);
        doc.text(`Date: ${invoice.date.toISOString().slice(0, 10)}`);
        doc.text(`Type: ${invoice.type.toUpperCase()}`);
        doc.moveDown();

        const party = invoice.party;
        doc.fontSize(14).text(`${invoice.partyModel} Details:`);
        doc.fontSize(12).text(`Name: ${party.name}`);
        if (party.phone) doc.text(`Phone: ${party.phone}`);
        if (party.email) doc.text(`Email: ${party.email}`);
        if (party.address) doc.text(`Address: ${party.address}`);
        doc.moveDown();

        // Table headers and rows here ...

        doc.end();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
  }
}
