import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';

interface Transaction {
  type: string;
  amount: number;
  partyId?: {
    name: string;
  };
  date: string | Date;
}

export const generateTransactionPDF = (transactions: Transaction[], filePath: string) => {
  const doc = new PDFDocument();
  const stream = doc.pipe(createWriteStream(filePath));

  doc.fontSize(16).text('Transaction Report', { align: 'center' });
  doc.moveDown();

  transactions.forEach((txn: Transaction, index: number) => {
    doc.fontSize(12).text(
      `${index + 1}. ${txn.type} ₹${txn.amount} to/from ${txn.partyId?.name || 'N/A'} on ${new Date(txn.date).toLocaleDateString()}`
    );
  });

  doc.end();
  return stream;
};
