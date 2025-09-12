// utils/pdfHelper.ts
import PDFDocument from 'pdfkit';
import { Sale } from '@/models/Sale';
import { Customer } from '@/models/customerModel';
import { Item } from '@/models/itemModel';
import { connectDB } from '@/lib/db';
import { Readable } from 'stream';

export const getSalePDF = async (saleId: string): Promise<Buffer> => {
  await connectDB();
  const sale = await Sale.findById(saleId)
    .populate('billTo')
    .populate('items.item');

  if (!sale) throw new Error('Sale not found');

  const customer = sale.billTo as typeof Customer;
  const doc = new PDFDocument({ margin: 50 });

  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice No: ${sale.invoiceNo}`);
  doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`);
  doc.text(`Customer: ${customer.name}`);
//   doc.text(`Phone: ${customer.phone}`);
//   doc.text(`Address: ${customer.address}`);
  doc.moveDown();

  doc.fontSize(14).text('Items:', { underline: true });
  sale.items.forEach((item: any, index: number) => {
    const itemData = item.item as typeof Item;
    doc.text(`${index + 1}. ${itemData.name} - Qty: ${item.quantity} Rate: ₹${item.rate} Total: ₹${item.total.toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: ₹${sale.invoiceAmount.toFixed(2)}`, { align: 'right' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};
