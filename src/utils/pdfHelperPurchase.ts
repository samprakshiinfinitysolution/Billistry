// utils/pdfHelper.ts
import PDFDocument from 'pdfkit';
import { Purchase } from '@/models/Purchase';
import { connectDB } from '@/lib/db';
import { tmpdir } from 'os';
import path from 'path';
import fs from 'fs';

export const getPurchasePDF = async (purchaseId: string): Promise<Buffer> => {
  await connectDB();
  const purchase = await Purchase.findById(purchaseId)
    .populate('supplier')
    .populate('items.item');

  if (!purchase) throw new Error('Purchase not found');

  const doc = new PDFDocument();
  const buffers: any[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(20).text(`Purchase Invoice - ${purchase.invoiceNo}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text(`Supplier: ${purchase.supplier.name}`);
  doc.text(`Date: ${new Date(purchase.date).toLocaleDateString()}`);
  doc.text(`Invoice Amount: ₹${purchase.invoiceAmount.toFixed(2)}`);
  doc.moveDown();

  doc.text('Items:', { underline: true });

  purchase.items.forEach((it: any, index: number) => {
    doc.moveDown(0.5);
    doc.text(
      `${index + 1}. ${it.item.name} - Qty: ${it.quantity}, Rate: ₹${it.rate}, Total: ₹${it.total}`
    );
  });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
};
