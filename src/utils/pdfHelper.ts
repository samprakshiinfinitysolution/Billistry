import PDFDocument from 'pdfkit';
import { writeFileSync } from 'fs';

export const generateTransactionPDF = (transactions: any[], filePath: string) => {
  const doc = new PDFDocument();
  const stream = doc.pipe(writeFileSync(filePath));

  doc.fontSize(16).text('Transaction Report', { align: 'center' });
  doc.moveDown();

  transactions.forEach((txn, index) => {
    doc.fontSize(12).text(
      `${index + 1}. ${txn.type} ₹${txn.amount} to/from ${txn.partyId?.name || 'N/A'} on ${new Date(txn.date).toLocaleDateString()}`
    );
  });

  doc.end();
  return stream;
};
